import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify the caller is authenticated
    const supabaseUser = await getSupabaseServer();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { winkelnaam, type, oppervlakte, opmerkingen, doelgroep, concurrenten, focusgebieden, prijssegment, fileName } = body;

    if (!winkelnaam || !type || !fileName) {
      return NextResponse.json({ error: 'Winkelnaam, type en bestandsnaam zijn verplicht' }, { status: 400 });
    }

    const analysisId = randomUUID();
    const fileExt = fileName.split('.').pop() || 'mp4';
    const storagePath = `${analysisId}/video.${fileExt}`;

    const { error: dbError } = await supabase.from('analyses').insert({
      id: analysisId,
      user_email: user.email,
      store_name: winkelnaam,
      store_type: type,
      area_sqm: oppervlakte ? parseInt(oppervlakte, 10) : null,
      notes: opmerkingen || null,
      target_audience: doelgroep || null,
      competitors: concurrenten || null,
      focus_areas: focusgebieden && focusgebieden.length > 0 ? focusgebieden : null,
      price_segment: prijssegment || null,
      status: 'pending',
      video_url: storagePath,
      result_json: null,
    });

    if (dbError) {
      console.error('[Upload] Database error:', JSON.stringify(dbError));
      return NextResponse.json({ error: `Analyse record aanmaken mislukt: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ analysisId, storagePath });
  } catch (err) {
    console.error('[Upload] Unhandled error:', err);
    return NextResponse.json({ error: `Interne serverfout: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }
}
