CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE api_keys(
  id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  api_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX api_keys_api_key_uniq ON api_keys(api_key);

CREATE TABLE users(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX users_provider_provider_id_uniq ON users(provider, provider_id);

