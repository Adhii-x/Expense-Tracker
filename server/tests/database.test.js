import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createDataStore } from '../database.js';

test('JSON data store persists financial records separately for each account', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'expense-tracker-data-'));
  const filePath = path.join(directory, 'db.json');
  const initialData = {
    budget: { monthlyLimit: 25000, currency: 'INR' },
    transactions: [{ id: 'demo', title: 'Demo record' }],
    cards: [],
    subscriptions: [],
    goals: []
  };
  const firstStore = createDataStore({ filePath, initialData });

  try {
    await firstStore.initialize();
    assert.deepEqual((await firstStore.readUser('account-one')).transactions, []);
    await firstStore.saveUser('account-one', {
      ...initialData,
      transactions: [{ id: 'one', title: 'Account one record' }]
    });

    assert.equal(await firstStore.hasUserData('account-one'), true);
    assert.equal(await firstStore.hasUserData('account-two'), false);
    assert.deepEqual((await firstStore.readUser('account-two')).transactions, []);

    const restartedStore = createDataStore({ filePath, initialData });
    await restartedStore.initialize();
    assert.deepEqual((await restartedStore.readUser('account-one')).transactions, [
      { id: 'one', title: 'Account one record' }
    ]);
    await restartedStore.deleteUser('account-one');
    assert.equal(await restartedStore.hasUserData('account-one'), false);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
