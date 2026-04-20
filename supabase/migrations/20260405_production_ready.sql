-- ============================================================
-- SmartZones — Productie migratie (definitief)
-- Voer uit NA: 20260101, 20260319, 20260402, 20260403, 20260404
-- ============================================================

-- ── Analyses: extra kolommen ────────────────────────────────
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS paid              BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mollie_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS frame_urls        TEXT[];

-- ── Analyses: RLS (idempotent) ──────────────────────────────
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analyses' AND policyname = 'Users can view own analyses'
  ) THEN
    CREATE POLICY "Users can view own analyses" ON analyses
      FOR SELECT USING (user_email = auth.email());
    CREATE POLICY "Users can insert own analyses" ON analyses
      FOR INSERT WITH CHECK (user_email = auth.email());
    CREATE POLICY "Service role has full access to analyses" ON analyses
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- ── User profiles: RLS (idempotent) ─────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  naam       TEXT,
  winkelnaam TEXT,
  email      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"   ON user_profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ── Bezoeker tracking (sz-pixel.js) ─────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id        TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ DEFAULT now(),
  metadata  JSONB       DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS visitor_events (
  id         BIGSERIAL PRIMARY KEY,
  visitor_id TEXT    NOT NULL,
  event      TEXT    NOT NULL,
  page       TEXT,
  metadata   JSONB   DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visitors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='visitors' AND policyname='Service role visitors') THEN
    CREATE POLICY "Service role visitors"       ON visitors       FOR ALL TO service_role USING (true);
    CREATE POLICY "Service role visitor_events" ON visitor_events FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- ── Agent systeem ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_config (
  agent_id         TEXT PRIMARY KEY,
  enabled          BOOLEAN DEFAULT true,
  interval_minutes INTEGER DEFAULT 60,
  last_run_at      TIMESTAMPTZ,
  next_run_at      TIMESTAMPTZ,
  settings         JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS agent_activity (
  id           SERIAL PRIMARY KEY,
  agent_id     TEXT NOT NULL,
  action       TEXT NOT NULL,
  details      TEXT,
  lead_company TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_activity' AND policyname='Service role agent_activity') THEN
    CREATE POLICY "Service role agent_activity" ON agent_activity FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- Seed agents (geen dubbelen)
INSERT INTO agent_config (agent_id, enabled, interval_minutes) VALUES
  ('research',    true,  360),
  ('enrichment',  false, 720),
  ('outreach',    true,  60),
  ('followup',    true,  120),
  ('reply',       false, 30),
  ('retargeting', false, 1440),
  ('nurture',     true,  10080)
ON CONFLICT (agent_id) DO NOTHING;

-- ── Tone config (AI prompt prefix) ──────────────────────────
CREATE TABLE IF NOT EXISTS tone_config (
  id                   SERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  system_prompt_prefix TEXT NOT NULL,
  is_default           BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- ── Webhook config ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_config (
  id      SERIAL PRIMARY KEY,
  url     TEXT    NOT NULL,
  events  TEXT[]  DEFAULT '{}',
  secret  TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Performance indexes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS analyses_user_email_idx      ON analyses(user_email);
CREATE INDEX IF NOT EXISTS analyses_status_idx          ON analyses(status);
CREATE INDEX IF NOT EXISTS analyses_mollie_payment_idx  ON analyses(mollie_payment_id) WHERE mollie_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS visitor_events_visitor_idx   ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS leads_stage_idx              ON leads(stage);
CREATE INDEX IF NOT EXISTS leads_score_idx              ON leads(score DESC);
