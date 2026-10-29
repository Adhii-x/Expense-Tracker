import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

function normalizeData(data, initialData) {
  return {
    ...initialData,
    ...data,
    budget: { ...initialData.budget, ...data.budget, currency: 'INR' },
    transactions: data.transactions || initialData.transactions,
    cards: data.cards || initialData.cards,
    subscriptions: data.subscriptions || initialData.subscriptions,
    goals: data.goals || initialData.goals
  };
}

function createUserInitialData(initialData) {
  return {
    budget: { ...initialData.budget, categoryBudgets: [] },
    transactions: [],
    cards: [],
    subscriptions: [],
    goals: []
  };
}

function userFilePath(filePath, userId) {
  const userKey = createHash('sha256').update(userId).digest('hex');
  return path.join(path.dirname(filePath), 'users', `${userKey}.json`);
}

async function loadLegacyData(filePath, initialData) {
  try {
    return normalizeData(JSON.parse(await fs.readFile(filePath, 'utf8')), initialData);
  } catch (error) {
    if (error.code === 'ENOENT') return normalizeData(initialData, initialData);
    throw error;
  }
}

async function loadFromPostgres(client) {
  const [transactions, cards, subscriptions, goals, settings] = await Promise.all([
    client.query("SELECT id, title, amount, type, category, to_char(date, 'YYYY-MM-DD') AS date, notes FROM transactions ORDER BY date DESC"),
    client.query('SELECT data FROM payment_cards ORDER BY sort_order'),
    client.query('SELECT data FROM subscriptions ORDER BY sort_order'),
    client.query('SELECT data FROM savings_goals ORDER BY sort_order'),
    client.query('SELECT data FROM app_settings WHERE id = 1')
  ]);

  return {
    transactions: transactions.rows.map(row => ({
      ...row,
      amount: Number(row.amount)
    })),
    cards: cards.rows.map(row => row.data),
    subscriptions: subscriptions.rows.map(row => row.data),
    goals: goals.rows.map(row => row.data),
    budget: settings.rows[0]?.data || { monthlyLimit: 25000, currency: 'INR' }
  };
}

async function insertData(client, data) {
  for (const transaction of data.transactions || []) {
    await client.query(
      `INSERT INTO transactions (id, title, amount, type, category, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [transaction.id, transaction.title, transaction.amount, transaction.type, transaction.category, transaction.date, transaction.notes || '']
    );
  }

  for (const [table, records] of [
    ['payment_cards', data.cards || []],
    ['subscriptions', data.subscriptions || []],
    ['savings_goals', data.goals || []]
  ]) {
    for (const [sortOrder, record] of records.entries()) {
      await client.query(
        `INSERT INTO ${table} (id, sort_order, data) VALUES ($1, $2, $3::jsonb)`,
        [record.id, sortOrder, JSON.stringify(record)]
      );
    }
  }

  await client.query(
    `INSERT INTO app_settings (id, data) VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [JSON.stringify({ ...data.budget, currency: 'INR' })]
  );
}

export function createDataStore({ databaseUrl, filePath, initialData }) {
  const userInitialData = createUserInitialData(initialData);
  if (!databaseUrl) {
    let currentData;
    return {
      mode: 'json',
      async initialize() {
        currentData = await loadLegacyData(filePath, initialData);
        return currentData;
      },
      read() {
        return currentData;
      },
      async save(data) {
        currentData = normalizeData(data, initialData);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(currentData, null, 2), 'utf8');
      },
      async readUser(userId) {
        return loadLegacyData(userFilePath(filePath, userId), userInitialData);
      },
      async saveUser(userId, data) {
        const destination = userFilePath(filePath, userId);
        const normalized = normalizeData(data, userInitialData);
        await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
        const temporaryPath = `${destination}.${process.pid}.${Date.now()}.tmp`;
        try {
          await fs.writeFile(temporaryPath, JSON.stringify(normalized, null, 2), { encoding: 'utf8', mode: 0o600 });
          await fs.rename(temporaryPath, destination);
        } catch (error) {
          await fs.rm(temporaryPath, { force: true });
          throw error;
        }
        return normalized;
      },
      async importUserData(userId, data) {
        const destination = userFilePath(filePath, userId);
        const normalized = normalizeData(data, userInitialData);
        await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
        try {
          await fs.writeFile(destination, JSON.stringify(normalized, null, 2), { encoding: 'utf8', flag: 'wx', mode: 0o600 });
          return normalized;
        } catch (error) {
          if (error.code === 'EEXIST') return null;
          throw error;
        }
      },
      async hasUserData(userId) {
        try {
          await fs.access(userFilePath(filePath, userId));
          return true;
        } catch (error) {
          if (error.code === 'ENOENT') return false;
          throw error;
        }
      },
      async deleteUser(userId) {
        await fs.rm(userFilePath(filePath, userId), { force: true });
      },
      async close() {}
    };
  }

  const pool = new Pool({ connectionString: databaseUrl });
  let currentData;
  let saveQueue = Promise.resolve();

  async function saveSnapshot(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE transactions, payment_cards, subscriptions, savings_goals');
      await insertData(client, data);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    mode: 'postgres',
    async initialize() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          amount NUMERIC(14, 2) NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          category TEXT NOT NULL,
          date DATE NOT NULL,
          notes TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS payment_cards (
          id TEXT PRIMARY KEY,
          sort_order INTEGER NOT NULL,
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY,
          sort_order INTEGER NOT NULL,
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS savings_goals (
          id TEXT PRIMARY KEY,
          sort_order INTEGER NOT NULL,
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS app_settings (
          id SMALLINT PRIMARY KEY CHECK (id = 1),
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS user_financial_data (
          user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(719204631)');
        const settings = await client.query('SELECT data FROM app_settings WHERE id = 1');
        if (settings.rowCount === 0) {
          const legacyData = await loadLegacyData(filePath, initialData);
          await insertData(client, legacyData);
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      currentData = normalizeData(await loadFromPostgres(pool), initialData);
      return currentData;
    },
    read() {
      return currentData;
    },
    async readUser(userId) {
      let result = await pool.query(
        'SELECT data FROM user_financial_data WHERE user_id = $1',
        [userId]
      );
      if (result.rows[0]) return normalizeData(result.rows[0].data, userInitialData);

      const legacyFile = userFilePath(filePath, userId);
      try {
        await fs.access(legacyFile);
      } catch (error) {
        if (error.code === 'ENOENT') return normalizeData(userInitialData, userInitialData);
        throw error;
      }

      const legacyData = await loadLegacyData(legacyFile, userInitialData);
      result = await pool.query(
        `INSERT INTO user_financial_data (user_id, data)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING data`,
        [userId, JSON.stringify(legacyData)]
      );
      if (result.rows[0]) return normalizeData(result.rows[0].data, userInitialData);

      result = await pool.query(
        'SELECT data FROM user_financial_data WHERE user_id = $1',
        [userId]
      );
      return normalizeData(result.rows[0]?.data || userInitialData, userInitialData);
    },
    async saveUser(userId, data) {
      const normalized = normalizeData(data, userInitialData);
      await pool.query(
        `INSERT INTO user_financial_data (user_id, data)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id)
         DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [userId, JSON.stringify(normalized)]
      );
      return normalized;
    },
    async importUserData(userId, data) {
      const normalized = normalizeData(data, userInitialData);
      const result = await pool.query(
        `INSERT INTO user_financial_data (user_id, data)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING user_id`,
        [userId, JSON.stringify(normalized)]
      );
      return result.rowCount ? normalized : null;
    },
    async hasUserData(userId) {
      const result = await pool.query(
        'SELECT 1 FROM user_financial_data WHERE user_id = $1',
        [userId]
      );
      return result.rowCount > 0;
    },
    async deleteUser(userId) {
      await pool.query('DELETE FROM user_financial_data WHERE user_id = $1', [userId]);
    },
    save(data) {
      const snapshot = structuredClone(normalizeData(data, initialData));
      const operation = saveQueue.catch(() => {}).then(() => saveSnapshot(snapshot));
      saveQueue = operation;
      return operation.then(() => {
        currentData = snapshot;
      });
    },
    async close() {
      await saveQueue;
      await pool.end();
    }
  };
}
