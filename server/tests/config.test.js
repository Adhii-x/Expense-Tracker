import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../config/env.js';

test('development defaults to the legacy demo mode', () => {
  assert.deepEqual(validateEnvironment({ NODE_ENV: 'development' }), { mode: 'demo' });
});

test('production fails closed while shared financial storage is in use', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'production', AUTH_MODE: 'authenticated' }),
    /Production startup is disabled/
  );
});

test('unimplemented auth modes cannot be enabled in development', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'development', AUTH_MODE: 'authenticated' }),
    /Only AUTH_MODE=demo is implemented/
  );
});
