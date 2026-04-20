import { createHash } from 'crypto';
import { supabase } from './supabase';
import { NextRequest } from 'next/server';

/**
 * Validate an API key from the Authorization header.
 * Returns the user email if valid, null if not.
 */
export async function authenticateApiKey(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const key = authHeader.slice(7);
  const keyHash = createHash('sha256').update(key).digest('hex');

  const { data, error } = await supabase
    .from('api_keys')
    .select('user_email')
    .eq('key_hash', keyHash)
    .single();

  if (error || !data) return null;

  // Update last_used
  await supabase
    .from('api_keys')
    .update({ last_used: new Date().toISOString() })
    .eq('key_hash', keyHash);

  return data.user_email;
}

/**
 * Generate a new API key for a user.
 * Returns the raw key (only shown once) and the key ID.
 */
export async function generateApiKey(userEmail: string, name: string): Promise<{ key: string; id: string }> {
  const rawKey = `sz_${createHash('sha256').update(`${userEmail}-${Date.now()}-${Math.random()}`).digest('hex').slice(0, 32)}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const { data, error } = await supabase
    .from('api_keys')
    .insert({ user_email: userEmail, key_hash: keyHash, name })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return { key: rawKey, id: data.id };
}
