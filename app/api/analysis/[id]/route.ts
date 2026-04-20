import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Verify session
  const supabaseUser = await getSupabaseServer();
  const { data: { user } } = await supabaseUser.auth.getUser();

  // Also allow internal calls from cron/webhook (x-internal-cron header)
  const internalHeader = request.headers.get('x-internal-cron') || '';
  const cronSecret = process.env.CRON_SECRET;
  const isInternalCall = Boolean(cronSecret && internalHeader === cronSecret);

  if (!user && !isInternalCall) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Analyse niet gevonden' }, { status: 404 });
  }

  // Ownership check (skip for internal calls)
  if (!isInternalCall && user && data.user_email !== user.email) {
    return NextResponse.json({ error: 'Geen toegang tot deze analyse' }, { status: 403 });
  }

  return NextResponse.json(data);
}
