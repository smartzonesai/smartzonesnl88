import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { canSendEmail } from '@/lib/spam-guard';

// GET — fetch drafts (optionally filter by lead_id or status)
export async function GET(request: NextRequest) {
  const leadId = request.nextUrl.searchParams.get('lead_id');
  const status = request.nextUrl.searchParams.get('status');

  let query = supabase.from('email_drafts').select('*').order('created_at', { ascending: false });

  if (leadId) query = query.eq('lead_id', parseInt(leadId));
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST — create a new draft
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('email_drafts')
    .insert({
      lead_id: body.lead_id || null,
      subject: body.subject,
      body: body.body,
      channel: body.channel || 'email',
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT — update a draft (edit subject/body, or approve)
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'id verplicht' }, { status: 400 });

  if (updates.status === 'approved') {
    updates.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from('email_drafts').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — send an approved draft
export async function PATCH(request: NextRequest) {
  const { draftId } = await request.json();

  if (!draftId) return NextResponse.json({ error: 'draftId verplicht' }, { status: 400 });

  // Fetch draft
  const { data: draft, error: fetchErr } = await supabase
    .from('email_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (fetchErr || !draft) return NextResponse.json({ error: 'Draft niet gevonden' }, { status: 404 });

  // Get lead email
  let toEmail = '';
  if (draft.lead_id) {
    const { data: lead } = await supabase.from('leads').select('email').eq('id', draft.lead_id).single();
    toEmail = lead?.email || '';

    // Spam guard check
    const check = await canSendEmail(draft.lead_id);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason, dailySent: check.dailySent, dailyLimit: check.dailyLimit }, { status: 429 });
    }
  }

  if (!toEmail) {
    return NextResponse.json({ error: 'Geen email adres gevonden voor deze lead' }, { status: 400 });
  }

  // Send via Resend
  const result = await sendEmail({
    to: toEmail,
    subject: draft.subject,
    body: draft.body,
    leadId: draft.lead_id,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Update draft status
  await supabase
    .from('email_drafts')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', draftId);

  return NextResponse.json({ ok: true, resendId: result.id });
}
