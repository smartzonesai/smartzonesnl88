import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

let cachedClient: Anthropic | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the cached Anthropic client.
 * Call this after saving or deleting an API key so the next request picks up the change.
 */
export function clearAnthropicClientCache(): void {
  cachedClient = null;
  cacheTimestamp = 0;
}

/**
 * Get an Anthropic client instance.
 * Priority: DB-stored active+valid key → env var fallback.
 * Results are cached for 5 minutes to avoid repeated DB lookups.
 */
export async function getAnthropicClient(): Promise<Anthropic> {
  const now = Date.now();

  if (cachedClient && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedClient;
  }

  // Try to fetch an active, verified key from the database
  try {
    const { data } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('provider', 'anthropic')
      .eq('is_active', true)
      .eq('verification_status', 'valid')
      .single();

    if (data?.encrypted_key) {
      cachedClient = new Anthropic({ apiKey: data.encrypted_key });
      cacheTimestamp = now;
      return cachedClient;
    }
  } catch {
    // DB lookup failed — fall through to env var
  }

  // Fallback to environment variable
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Geen Anthropic API-sleutel beschikbaar. Configureer een sleutel in de admin-instellingen of stel ANTHROPIC_API_KEY in als omgevingsvariabele.',
    );
  }

  cachedClient = new Anthropic({ apiKey });
  cacheTimestamp = now;
  return cachedClient;
}
