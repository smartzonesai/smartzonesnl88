import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  // Verify session — user can only see their own analyses
  const supabaseUser = await getSupabaseServer();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('id, store_name, store_type, status, created_at, result_json')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 });
  }

  const analyses = (data || []).map((row) => ({
    id: row.id,
    store_name: row.store_name,
    store_type: row.store_type,
    status: row.status,
    created_at: row.created_at,
    zones_count: row.result_json?.overview?.zones_count || 0,
    growth_potential: row.result_json?.overview?.growth_potential || '-',
  }));

  return NextResponse.json(analyses);
}
