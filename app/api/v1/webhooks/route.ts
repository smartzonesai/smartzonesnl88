import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authenticateApiKey } from '@/lib/api-auth';
import { randomBytes } from 'crypto';

/**
 * Public API v1 — Webhooks
 * GET — list webhooks
 * POST — register a webhook
 * DELETE — remove a webhook
 */
export async function GET(request: NextRequest) {
  const userEmail = await authenticateApiKey(request);
  if (!userEmail) return NextResponse.json({ error: 'Ongeldige API key' }, { status: 401 });

  const { data } = await supabase
    .from('webhooks')
    .select('id, url, events, active, created_at')
    .eq('user_email', userEmail);

  return NextResponse.json({ webhooks: data || [] });
}

export async function POST(request: NextRequest) {
  const userEmail = await authenticateApiKey(request);
  if (!userEmail) return NextResponse.json({ error: 'Ongeldige API key' }, { status: 401 });

  const body = await request.json();
  if (!body.url) return NextResponse.json({ error: 'url verplicht' }, { status: 400 });

  const secret = randomBytes(32).toString('hex');

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      user_email: userEmail,
      url: body.url,
      events: body.events || ['analysis.complete'],
      secret,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ webhook: { ...data, secret } }); // Secret only shown once
}

export async function DELETE(request: NextRequest) {
  const userEmail = await authenticateApiKey(request);
  if (!userEmail) return NextResponse.json({ error: 'Ongeldige API key' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id verplicht' }, { status: 400 });

  await supabase.from('webhooks').delete().eq('id', id).eq('user_email', userEmail);
  return NextResponse.json({ ok: true });
}
