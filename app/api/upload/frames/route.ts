import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/**
 * POST /api/upload/frames
 * Saves extracted frame URLs to the analysis record so the Mollie
 * webhook can trigger the AI analysis without re-extracting frames.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getSupabaseServer();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { analysisId, frameUrls } = await request.json();
    if (!analysisId || !Array.isArray(frameUrls)) {
      return NextResponse.json({ error: 'analysisId en frameUrls verplicht' }, { status: 400 });
    }

    // Only update if the analysis belongs to this user
    const { error } = await supabase
      .from('analyses')
      .update({ frame_urls: frameUrls })
      .eq('id', analysisId)
      .eq('user_email', user.email);

    if (error) {
      console.error('[Upload/Frames] DB error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Upload/Frames] Error:', err);
    return NextResponse.json({ error: 'Interne fout' }, { status: 500 });
  }
}
