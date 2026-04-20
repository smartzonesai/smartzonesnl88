import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authenticateApiKey } from '@/lib/api-auth';

/**
 * Public API v1 — Single Analysis
 * GET /api/v1/analyses/:id — get analysis result
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userEmail = await authenticateApiKey(request);
  if (!userEmail) {
    return NextResponse.json({ error: 'Ongeldige API key' }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .eq('user_email', userEmail)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Analyse niet gevonden' }, { status: 404 });
  }

  return NextResponse.json(data);
}
