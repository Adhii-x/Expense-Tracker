-- Authentication foundation. Apply explicitly with psql after backing up the DB.
-- This schema does not migrate the legacy shared ledger; see README.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email TEXT NOT NULL,
  password_hash TEXT,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_active_uq
  ON auth_users (lower(email)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS oauth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google','github','microsoft','apple')),
  provider_subject TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_subject)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  sid TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expiry_idx ON user_sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify_email','reset_password','magic_link','email_otp','sms_otp')),
  token_hash BYTEA NOT NULL,
  destination TEXT,
  attempts SMALLINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_tokens_lookup_idx ON auth_tokens(purpose, token_hash) WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS auth_tokens_expiry_idx ON auth_tokens(expires_at);

CREATE TABLE IF NOT EXISTS mfa_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('totp','email','sms')),
  secret_ciphertext BYTEA,
  enabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS mfa_methods_user_type_uq ON mfa_methods(user_id, method);

CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  code_hash BYTEA NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS passkey_credentials (
  credential_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  public_key BYTEA NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] NOT NULL DEFAULT '{}',
  label TEXT NOT NULL DEFAULT 'Passkey',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS passkey_user_idx ON passkey_credentials(user_id) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ip_hash BYTEA,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_events_user_time_idx ON security_events(user_id, created_at DESC);

-- User-owned financial storage is intentionally a separate migration and is a
-- prerequisite for enabling authenticated production financial APIs.
