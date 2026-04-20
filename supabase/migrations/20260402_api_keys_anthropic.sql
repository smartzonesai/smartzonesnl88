-- ==========================================
-- Extend api_keys table for Anthropic API key management
-- ==========================================

-- Add provider column to identify the service
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'anthropic';

-- Add encrypted_key to store the actual key value (needed for API calls)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS encrypted_key TEXT;

-- Add activation flag
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add verification tracking
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'valid', 'invalid'));

-- Ensure only one key per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys (provider);
