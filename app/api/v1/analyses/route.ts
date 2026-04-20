import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authenticateApiKey } from '@/lib/api-auth';

/**
 * Public API v1 — Analyses
 * GET /api/v1/analyses — list analyses for the authenticated user
 */
export async function GET(request: NextRequest) {
  const userEmail = await authenticateApiKey(request);
  if (!userEmail) {
    return NextResponse.json({ error: 'Ongeldige API key' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('id, store_name, store_type, area_sqm, status, created_at')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ analyses: data || [] });
}
