import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';
import Papa from 'papaparse';

/**
 * POS data upload endpoint.
 * Accepts CSV with columns: date, transactions, revenue, avg_basket
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const supabaseUser = await getSupabaseServer();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { analysisId, csvData, manualEntry } = body;

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId verplicht' }, { status: 400 });
    }

    // Verify ownership of the analysis
    const { data: analysis } = await supabase
      .from('analyses')
      .select('user_email')
      .eq('id', analysisId)
      .single();

    if (!analysis || analysis.user_email !== user.email) {
      return NextResponse.json({ error: 'Geen toegang tot deze analyse' }, { status: 403 });
    }

    let rows: Array<Record<string, unknown>> = [];

    if (csvData) {
      // Parse CSV
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      rows = (parsed.data as Array<Record<string, string>>).map(row => ({
        analysis_id: analysisId,
        date: row.date || row.datum || new Date().toISOString().split('T')[0],
        total_transactions: parseInt(row.transactions || row.transacties || '0') || 0,
        total_revenue: parseFloat(row.revenue || row.omzet || '0') || 0,
        avg_basket: parseFloat(row.avg_basket || row.gemiddelde_mandje || '0') || 0,
        top_products: null,
      }));
    } else if (manualEntry) {
      rows = [{
        analysis_id: analysisId,
        date: manualEntry.date || new Date().toISOString().split('T')[0],
        total_transactions: manualEntry.transactions || 0,
        total_revenue: manualEntry.revenue || 0,
        avg_basket: manualEntry.avg_basket || 0,
        top_products: manualEntry.top_products || null,
      }];
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Geen data ontvangen' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pos_data')
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inserted: data?.length || 0 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Onbekende fout' }, { status: 500 });
  }
}

// GET — fetch POS data for an analysis
export async function GET(request: NextRequest) {
  const analysisId = request.nextUrl.searchParams.get('analysisId');
  if (!analysisId) return NextResponse.json({ error: 'analysisId verplicht' }, { status: 400 });

  const { data, error } = await supabase
    .from('pos_data')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
