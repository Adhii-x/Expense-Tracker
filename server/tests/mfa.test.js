import test from 'node:test';
import assert from 'node:assert/strict';
import { generate, generateSecret } from 'otplib';
import {
  decryptTotpSecret,
  encryptTotpSecret,
  verifyTotpCode
} from '../services/mfaService.js';

const encryptionKey = Buffer.alloc(32, 23).toString('base64');

test('TOTP secret encryption authenticates ciphertext and hides the seed', () => {
  const secret = generateSecret();
  const encrypted = encryptTotpSecret(secret, encryptionKey);
  assert.notEqual(encrypted.toString('utf8'), secret);
  assert.equal(decryptTotpSecret(encrypted, encryptionKey), secret);
  const tampered = Buffer.from(encrypted);
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => decryptTotpSecret(tampered, encryptionKey));
});

test('TOTP accepts current authenticator code and rejects invalid input', async () => {
  const secret = generateSecret();
  const token = await generate({ secret });
  assert.equal(await verifyTotpCode(secret, token), true);
  assert.equal(await verifyTotpCode(secret, '00000x'), false);
  assert.equal(await verifyTotpCode(secret, '123456'), false);
});

test('TOTP encryption key must be 32 bytes', () => {
  assert.throws(() => encryptTotpSecret('seed', 'short'), /exactly 32 bytes/);
});
