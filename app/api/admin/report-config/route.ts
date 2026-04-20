import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET — fetch report config for an analysis
export async function GET(request: NextRequest) {
  const analysisId = request.nextUrl.searchParams.get('analysisId');
  if (!analysisId) return NextResponse.json({ error: 'analysisId verplicht' }, { status: 400 });

  const { data, error } = await supabase
    .from('report_config')
    .select('*')
    .eq('analysis_id', analysisId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return default config if none exists
  return NextResponse.json(data || {
    analysis_id: analysisId,
    sections_order: ['overview', 'zones', 'floor_plan', 'heatmap', 'behavioral', 'implementation'],
    hidden_sections: [],
    custom_notes: {},
    logo_url: null,
  });
}

// POST — create or update report config
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { analysisId, sections_order, hidden_sections, custom_notes, logo_url } = body;

  if (!analysisId) return NextResponse.json({ error: 'analysisId verplicht' }, { status: 400 });

  const { data, error } = await supabase
    .from('report_config')
    .upsert({
      analysis_id: analysisId,
      sections_order: sections_order || ['overview', 'zones', 'floor_plan', 'heatmap', 'behavioral', 'implementation'],
      hidden_sections: hidden_sections || [],
      custom_notes: custom_notes || {},
      logo_url: logo_url || null,
    }, { onConflict: 'analysis_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
