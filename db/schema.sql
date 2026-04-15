CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at);

CREATE TABLE IF NOT EXISTS connected_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  external_account_id TEXT,
  tenant_id TEXT,
  scope TEXT,
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT connected_accounts_provider_check CHECK (provider IN ('UPWORK')),
  CONSTRAINT connected_accounts_status_check CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED', 'ERROR')),
  CONSTRAINT connected_accounts_provider_user_key UNIQUE (provider, user_id)
);

CREATE INDEX IF NOT EXISTS connected_accounts_user_status_idx
  ON connected_accounts (user_id, status);
CREATE INDEX IF NOT EXISTS connected_accounts_provider_tenant_idx
  ON connected_accounts (provider, tenant_id);

CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  upwork_profile_id TEXT UNIQUE,
  profile_title TEXT,
  overview TEXT,
  hourly_rate_usd_cents INTEGER,
  profile_url TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  raw_payload JSONB,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS freelancer_profiles_synced_at_idx
  ON freelancer_profiles (synced_at);

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_roles TEXT[] NOT NULL DEFAULT '{}',
  preferred_keywords TEXT[] NOT NULL DEFAULT '{}',
  excluded_keywords TEXT[] NOT NULL DEFAULT '{}',
  preferred_industries TEXT[] NOT NULL DEFAULT '{}',
  minimum_hourly_rate_usd NUMERIC(10, 2),
  minimum_fixed_budget_usd NUMERIC(10, 2),
  contract_type TEXT NOT NULL DEFAULT 'BOTH',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_preferences_contract_type_check CHECK (contract_type IN ('HOURLY', 'FIXED_PRICE', 'BOTH'))
);

CREATE INDEX IF NOT EXISTS user_preferences_contract_type_idx
  ON user_preferences (contract_type);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  provider_job_id TEXT NOT NULL UNIQUE,
  provider_ciphertext TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contract_type TEXT,
  experience_level TEXT,
  hourly_min_usd NUMERIC(10, 2),
  hourly_max_usd NUMERIC(10, 2),
  fixed_budget_usd NUMERIC(10, 2),
  duration_label TEXT,
  category TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  client_country TEXT,
  client_total_hires INTEGER,
  client_total_posted_jobs INTEGER,
  client_total_reviews INTEGER,
  client_total_feedback NUMERIC(5, 2),
  published_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS jobs_published_at_idx ON jobs (published_at);
CREATE INDEX IF NOT EXISTS jobs_expires_at_idx ON jobs (expires_at);
CREATE INDEX IF NOT EXISTS jobs_last_seen_at_idx ON jobs (last_seen_at);

CREATE TABLE IF NOT EXISTS job_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  skill_score INTEGER NOT NULL,
  keyword_score INTEGER NOT NULL,
  budget_score INTEGER NOT NULL,
  preference_score INTEGER NOT NULL,
  freshness_score INTEGER NOT NULL,
  penalty_score INTEGER NOT NULL,
  explanation JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT job_scores_user_job_key UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS job_scores_user_overall_idx
  ON job_scores (user_id, overall_score DESC);

CREATE TABLE IF NOT EXISTS job_user_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'NEW',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT job_user_states_state_check CHECK (state IN ('NEW', 'SAVED', 'DISMISSED', 'APPLIED')),
  CONSTRAINT job_user_states_user_job_key UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS job_user_states_user_state_idx
  ON job_user_states (user_id, state);

CREATE TABLE IF NOT EXISTS proposal_assists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  opening_angle TEXT,
  key_proof_points TEXT[] NOT NULL DEFAULT '{}',
  risks_to_address TEXT[] NOT NULL DEFAULT '{}',
  client_questions TEXT[] NOT NULL DEFAULT '{}',
  tone_guidance TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT proposal_assists_user_job_key UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sync_runs_type_check CHECK (type IN ('PROFILE_SYNC', 'JOB_INGEST', 'JOB_RANK', 'FULL_REFRESH', 'CLEANUP', 'PROPOSAL_ASSIST')),
  CONSTRAINT sync_runs_status_check CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS sync_runs_user_created_at_idx
  ON sync_runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sync_runs_status_type_idx
  ON sync_runs (status, type);
