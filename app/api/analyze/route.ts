import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';
import { extractFrames } from '@/lib/video-processor';
import { runAnalysis } from '@/lib/analysis-agent';
import { generateVisualGuides } from '@/lib/visual-generator';
import { validateResult, normalizeResult } from '@/lib/calibration';
import { dispatchWebhook } from '@/lib/webhook';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing + AI calls

export async function POST(request: NextRequest) {
  try {
    const { analysisId, frameUrls: clientFrameUrls } = await request.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId is verplicht' }, { status: 400 });
    }

    // Allow internal calls from Mollie webhook (x-internal-cron header)
    const cronSecret = process.env.CRON_SECRET;
    const internalHeader = request.headers.get('x-internal-cron') || '';
    const isInternalCall = Boolean(cronSecret && internalHeader === cronSecret);

    // Verify auth for external calls
    if (!isInternalCall) {
      const supabaseUser = await getSupabaseServer();
      const { data: { user } } = await supabaseUser.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
      }
    }

    // Fetch the analysis record
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'Analyse niet gevonden' }, { status: 404 });
    }



    // Update status to processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    try {
      // Step 1: Use client-extracted frames, or fall back to server extraction
      let frameUrls: string[] = [];
      if (clientFrameUrls && Array.isArray(clientFrameUrls) && clientFrameUrls.length > 0) {
        console.log(`[${analysisId}] Using ${clientFrameUrls.length} client-extracted frames`);
        frameUrls = clientFrameUrls;
      } else {
        console.log(`[${analysisId}] Extracting frames server-side...`);
        frameUrls = await extractFrames(analysis.video_url, analysisId, 10);
      }
      console.log(`[${analysisId}] Got ${frameUrls.length} frames`);

      if (frameUrls.length === 0) {
        throw new Error('Geen frames konden worden ge-extraheerd uit de video');
      }

      // Log frame references for debugging
      console.log(`[${analysisId}] Frame references:`, frameUrls.slice(0, 2), '...');

      // Step 2: Run AI analysis on frames
      console.log(`[${analysisId}] Running AI analysis...`);
      let result = await runAnalysis(frameUrls, {
        storeName: analysis.store_name,
        storeType: analysis.store_type,
        areaSqm: analysis.area_sqm,
        notes: analysis.notes,
        target_audience: analysis.target_audience,
        competitors: analysis.competitors,
        focus_areas: analysis.focus_areas,
        price_segment: analysis.price_segment,
      });
      console.log(`[${analysisId}] AI analysis complete`);

      // Step 3: Generate annotated visual guides
      console.log(`[${analysisId}] Generating visual guides...`);
      result = await generateVisualGuides(analysisId, result);
      console.log(`[${analysisId}] Visual guides complete`);

      // Step 4: Validate and normalize results
      const validation = validateResult(result);
      result = normalizeResult(result);
      console.log(`[${analysisId}] Calibration score: ${validation.score}/100, warnings: ${validation.warnings.length}`);

      // Step 5: Save results
      await supabase
        .from('analyses')
        .update({
          status: 'complete',
          result_json: result,
        })
        .eq('id', analysisId);

      console.log(`[${analysisId}] Analysis complete!`);

      // Stuur e-mailnotificatie naar de klant
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartzones.nl';
      sendEmail({
        to: analysis.user_email,
        subject: `Uw analyse van ${analysis.store_name} is klaar`,
        body: `Goed nieuws! De AI-analyse van uw winkel "${analysis.store_name}" is voltooid.\n\nBekijk uw volledige rapport met implementatieplan, vloerplattegrond en heatmap via uw dashboard:\n${siteUrl}/dashboard/analysis/${analysisId}\n\nMet vriendelijke groet,\nHet Smart Zones team`,
      }).catch(() => {}); // Fire and forget — niet-kritiek

      // Dispatch webhook
      dispatchWebhook('analysis.complete', { analysisId, storeName: analysis.store_name, status: 'complete' }).catch(() => {});
      return NextResponse.json({ status: 'complete', analysisId });
    } catch (processingError) {
      console.error(`[${analysisId}] Processing failed:`, processingError);

      await supabase
        .from('analyses')
        .update({ status: 'failed' })
        .eq('id', analysisId);

      return NextResponse.json(
        { error: 'Analyse verwerking mislukt', details: String(processingError) },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error('Analyze handler error:', err);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
