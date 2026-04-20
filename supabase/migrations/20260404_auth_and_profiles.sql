-- ============================================================
-- SmartZones — User profiles table
-- Run after 20260101_base_schema.sql
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  naam TEXT,
  winkelnaam TEXT,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only read/write their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can upsert own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Also update analyses RLS: users can only see their own analyses
-- (Supabase auth.uid() vs email match)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Service role has full access to analyses" ON analyses
  FOR ALL TO service_role USING (true);

-- Add payment tracking to analyses
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Store pre-extracted frame URLs so Stripe webhook can use them
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS frame_urls TEXT[];
