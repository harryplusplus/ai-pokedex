-- Up Migration
CREATE TABLE api_keys (
  id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  api_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX api_keys_api_key_uniq ON api_keys (api_key);

-- Down Migration
