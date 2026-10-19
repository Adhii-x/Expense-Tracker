import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../config/env.js';

test('development defaults to authenticated mode', () => {
  assert.deepEqual(validateEnvironment({ NODE_ENV: 'development' }), { mode: 'authenticated' });
});

test('demo mode is available when explicitly selected', () => {
  assert.deepEqual(validateEnvironment({ NODE_ENV: 'development', AUTH_MODE: 'demo' }), { mode: 'demo' });
});

test('production fails closed while shared financial storage is in use', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'production', AUTH_MODE: 'authenticated' }),
    /Production startup is disabled/
  );
});

test('unknown auth modes are rejected', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'development', AUTH_MODE: 'invalid' }),
    /AUTH_MODE must be either demo or authenticated/
  );
});
