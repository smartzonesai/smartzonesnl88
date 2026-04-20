-- ============================================
-- SmartZones - Full Base Schema
-- Run this FIRST on a fresh Supabase project
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. analyses - Core store analysis records
-- ==========================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_type TEXT NOT NULL,
  area_sqm NUMERIC,
  notes TEXT,
  target_audience TEXT,
  competitors TEXT,
  focus_areas TEXT[],
  price_segment TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  video_url TEXT NOT NULL,
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. leads - CRM lead tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  company TEXT,
  contact TEXT,
  role TEXT,
  email TEXT,
  city TEXT,
  store_type TEXT,
  employees TEXT,
  stage TEXT DEFAULT 'new',
  score INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  last_action TEXT,
  last_action_date TIMESTAMPTZ,
  source TEXT,
  notes TEXT,
  sequence TEXT,
  next_follow_up TIMESTAMPTZ
);

-- ==========================================
-- 3. email_log - Sent email tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS email_log (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  resend_id TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'sent',
  variant TEXT,
  ab_test_id UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ
);

-- ==========================================
-- 4. email_drafts - Draft emails for review
-- ==========================================
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT,
  channel TEXT DEFAULT 'email',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- ==========================================
-- 5. ab_tests - A/B test configurations
-- ==========================================
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variant_a_subject TEXT,
  variant_a_body TEXT,
  variant_b_subject TEXT,
  variant_b_body TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from email_log to ab_tests (after ab_tests exists)
ALTER TABLE email_log
  ADD CONSTRAINT email_log_ab_test_fk
  FOREIGN KEY (ab_test_id) REFERENCES ab_tests(id) ON DELETE SET NULL;

-- ==========================================
-- 6. tone_config - Tone of voice settings
-- ==========================================
CREATE TABLE IF NOT EXISTS tone_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt_prefix TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO tone_config (name, description, system_prompt_prefix, is_default) VALUES
  ('Formeel', 'Zakelijke, professionele communicatie', 'Je communiceert op een formele, zakelijke manier. Gebruik volledige zinnen, vermijd informeel taalgebruik, en spreek de lezer aan met "u".', false),
  ('Informeel', 'Vriendelijk en toegankelijk', 'Je communiceert op een informele, vriendelijke manier. Gebruik "je" en "jij", wees direct en toegankelijk. Schrijf alsof je tegen een vriend praat die een winkel heeft.', true),
  ('Zakelijk-warm', 'Professioneel maar menselijk', 'Je communiceert professioneel maar warm en menselijk. Gebruik "u" maar wees niet stijf. Toon begrip voor de uitdagingen van de winkelier en geef concrete, praktische adviezen.', false);

-- ==========================================
-- 7. api_keys - API key management
-- ==========================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 8. webhooks - Webhook configurations
-- ==========================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[],
  secret TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 9. report_config - Custom report settings
-- ==========================================
CREATE TABLE IF NOT EXISTS report_config (
  analysis_id UUID PRIMARY KEY REFERENCES analyses(id) ON DELETE CASCADE,
  sections_order JSONB,
  hidden_sections JSONB,
  custom_notes JSONB,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 10. pos_data - Point of sale data
-- ==========================================
CREATE TABLE IF NOT EXISTS pos_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  date DATE,
  total_transactions INTEGER,
  total_revenue NUMERIC,
  avg_basket NUMERIC,
  top_products JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 11. visitors - Visitor tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ DEFAULT now(),
  pages_viewed INTEGER DEFAULT 0
);

-- ==========================================
-- 12. visitor_events - Visitor event log
-- ==========================================
CREATE TABLE IF NOT EXISTS visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT REFERENCES visitors(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  page TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 13. agent_config - AI agent settings
-- ==========================================
CREATE TABLE IF NOT EXISTS agent_config (
  agent_id TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  interval_minutes INTEGER DEFAULT 60,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 14. agent_activity - AI agent action log
-- ==========================================
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT REFERENCES agent_config(agent_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  lead_company TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Indexes for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_analyses_user_email ON analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_email_log_lead_id ON email_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_drafts_lead_id ON email_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_email ON api_keys(user_email);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_email ON webhooks(user_email);
CREATE INDEX IF NOT EXISTS idx_pos_data_analysis_id ON pos_data(analysis_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent_id ON agent_activity(agent_id);
