import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Visitor tracking endpoint.
 * Receives events from the sz-pixel.js script.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_id, event, page, metadata } = body;

    if (!visitor_id || !event) {
      return NextResponse.json({ ok: true });
    }

    // Log the event
    await supabase.from('visitor_events').insert({
      visitor_id,
      event,
      page: page || '/',
      metadata: metadata || {},
    });

    // Upsert visitor record
    await supabase
      .from('visitors')
      .upsert({
        id: visitor_id,
        last_seen: new Date().toISOString(),
        pages_viewed: 1,
      }, { onConflict: 'id' });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
