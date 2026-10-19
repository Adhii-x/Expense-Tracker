import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

const RECOVERY_CODE_COUNT = 10;

function encryptionKey(value = process.env.MFA_ENCRYPTION_KEY) {
  if (!value) throw new Error('MFA_ENCRYPTION_KEY is required to use TOTP enrollment.');
  const key = /^[a-f0-9]{64}$/i.test(value) ? Buffer.from(value, 'hex') : Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('MFA_ENCRYPTION_KEY must encode exactly 32 bytes as hex or base64.');
  return key;
}

export function encryptTotpSecret(secret, keyValue) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(keyValue), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
}

export function decryptTotpSecret(payload, keyValue) {
  const buffer = Buffer.from(payload);
  if (buffer.length < 29) throw new Error('Stored TOTP secret is invalid.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(keyValue), buffer.subarray(0, 12));
  decipher.setAuthTag(buffer.subarray(12, 28));
  return Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString('utf8');
}

function recoveryHash(code, pepper = process.env.RECOVERY_CODE_PEPPER) {
  if (!pepper || Buffer.byteLength(pepper) < 32) {
    throw new Error('RECOVERY_CODE_PEPPER must contain at least 32 bytes.');
  }
  return createHash('sha256').update(pepper).update(':').update(code).digest();
}

export async function createTotpEnrollment(pool, userId, email) {
  const secret = generateSecret();
  const uri = generateURI({ issuer: 'Expense Tracker Pro', label: email, secret });
  const qrCodeDataUrl = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 1, width: 240 });
  const ciphertext = encryptTotpSecret(secret);

  const saved = await pool.query(
    `INSERT INTO mfa_methods (user_id, method, secret_ciphertext, enabled_at)
     VALUES ($1, 'totp', $2, NULL)
     ON CONFLICT (user_id, method) DO UPDATE
     SET secret_ciphertext = EXCLUDED.secret_ciphertext, enabled_at = NULL, created_at = now()
     WHERE mfa_methods.enabled_at IS NULL`,
    [userId, ciphertext]
  );
  if (!saved.rowCount) throw new Error('TOTP is already enabled; reauthentication is required before changing it.');

  // Only the QR is returned; the raw provisioning URI and seed remain server-side.
  return { qrCodeDataUrl, expiresInSeconds: 600 };
}

async function getPendingSecret(pool, userId) {
  const result = await pool.query(
    `SELECT secret_ciphertext FROM mfa_methods
     WHERE user_id = $1 AND method = 'totp' AND enabled_at IS NULL
       AND created_at > now() - interval '10 minutes'`,
    [userId]
  );
  if (!result.rowCount) return null;
  return decryptTotpSecret(result.rows[0].secret_ciphertext);
}

export async function verifyTotpCode(secret, token) {
  if (!/^\d{6}$/.test(String(token || ''))) return false;
  const result = await verify({ secret, token: String(token), epochTolerance: 30 });
  return result.valid;
}

async function verifiedTotpStep(secret, token) {
  if (!/^\d{6}$/.test(String(token || ''))) return null;
  const result = await verify({ secret, token: String(token), epochTolerance: 30 });
  return result.valid ? Number(result.timeStep) : null;
}

function newRecoveryCode() {
  const raw = randomBytes(20).toString('hex').toUpperCase();
  return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15)}`;
}

export async function enableTotp(pool, userId, token) {
  const secret = await getPendingSecret(pool, userId);
  const timeStep = secret ? await verifiedTotpStep(secret, token) : null;
  if (timeStep === null) return null;

  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, newRecoveryCode);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const enabled = await client.query(
      `UPDATE mfa_methods SET enabled_at = now(), last_totp_counter = $2
       WHERE user_id = $1 AND method = 'totp' AND enabled_at IS NULL`,
      [userId, timeStep]
    );
    if (!enabled.rowCount) {
      await client.query('ROLLBACK');
      return null;
    }
    for (const code of codes) {
      await client.query(
        'INSERT INTO mfa_recovery_codes (user_id, code_hash) VALUES ($1, $2)',
        [userId, recoveryHash(code)]
      );
    }
    await client.query('COMMIT');
    return codes;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function verifyEnabledTotp(pool, userId, token) {
  const result = await pool.query(
    `SELECT secret_ciphertext, last_totp_counter FROM mfa_methods
     WHERE user_id = $1 AND method = 'totp' AND enabled_at IS NOT NULL`,
    [userId]
  );
  if (!result.rowCount) return false;
  const secret = decryptTotpSecret(result.rows[0].secret_ciphertext);
  const timeStep = await verifiedTotpStep(secret, token);
  if (timeStep === null || timeStep <= Number(result.rows[0].last_totp_counter || 0)) return false;
  const consumed = await pool.query(
    `UPDATE mfa_methods SET last_totp_counter = $2
     WHERE user_id = $1 AND method = 'totp' AND last_totp_counter < $2`,
    [userId, timeStep]
  );
  return consumed.rowCount === 1;
}

export async function consumeRecoveryCode(pool, userId, suppliedCode) {
  const code = String(suppliedCode || '').replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
  if (!/^[A-F0-9]{40}$/.test(code)) return false;
  const hash = recoveryHash(code);
  // The conditional update consumes a code once even when requests race.
  const result = await pool.query(
    `UPDATE mfa_recovery_codes SET consumed_at = now()
     WHERE user_id = $1 AND code_hash = $2 AND consumed_at IS NULL
     RETURNING id`,
    [userId, hash]
  );
  return result.rowCount === 1;
}

export async function disableTotp(pool, userId) {
  await pool.query('DELETE FROM mfa_methods WHERE user_id = $1 AND method = \'totp\'', [userId]);
  await pool.query('DELETE FROM mfa_recovery_codes WHERE user_id = $1', [userId]);
}
