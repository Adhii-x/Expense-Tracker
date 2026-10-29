import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../config/env.js';

test('development defaults to authenticated mode', () => {
  assert.deepEqual(validateEnvironment({ NODE_ENV: 'development' }), { mode: 'authenticated' });
});

test('demo mode is available when explicitly selected', () => {
  assert.deepEqual(validateEnvironment({ NODE_ENV: 'development', AUTH_MODE: 'demo' }), { mode: 'demo' });
});

test('production requires durable account storage and sessions', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'production', AUTH_MODE: 'authenticated' }),
    /Production requires DATABASE_URL and SESSION_SECRET/
  );
  assert.deepEqual(validateEnvironment({
    NODE_ENV: 'production',
    AUTH_MODE: 'authenticated',
    DATABASE_URL: 'postgres://db',
    SESSION_SECRET: 'test-secret'
  }), { mode: 'authenticated' });
});

test('production rejects demo authentication mode', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'production', AUTH_MODE: 'demo', DATABASE_URL: 'postgres://db', SESSION_SECRET: 'test-secret' }),
    /Production requires AUTH_MODE=authenticated/
  );
});

test('unknown auth modes are rejected', () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: 'development', AUTH_MODE: 'invalid' }),
    /AUTH_MODE must be either demo or authenticated/
  );
});
