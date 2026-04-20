import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/client-analyses
 * Admin-only: returns all analyses across all users.
 * Protected by Basic Auth in middleware (ADMIN_PASSWORD).
 */
export async function GET() {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, store_name, store_type, status, created_at, paid, user_email')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
