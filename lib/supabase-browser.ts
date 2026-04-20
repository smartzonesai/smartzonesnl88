import { createBrowserClient } from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns a singleton Supabase client for use in browser/client components.
 * Uses @supabase/ssr so auth state is stored in cookies (not localStorage),
 * making it accessible to middleware and server components.
 */
export function getSupabaseBrowser() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  _client = createBrowserClient(url, key);
  return _client;
}
