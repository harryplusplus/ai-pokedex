CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE api_keys(
  id int GENERATED ALWAYS AS IDENTITY NOT NULL,
  api_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_keys
  ADD CONSTRAINT api_keys_id_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX api_keys_api_key_key ON api_keys(api_key);

CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE users
  ADD CONSTRAINT users_id_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX users_provider_provider_id_key ON users(provider, provider_user_id)
WHERE
  deleted_at IS NULL;

CREATE TABLE refresh_tokens(
  id int GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  refresh_token text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT TRUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE refresh_tokens
  ADD CONSTRAINT refresh_tokens_id_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX refresh_tokens_refresh_token_key ON refresh_tokens(refresh_token);

CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens(user_id);

ALTER TABLE refresh_tokens
  ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

