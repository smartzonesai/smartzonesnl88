import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET — fetch all leads
export async function GET() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST — create a new lead
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Support batch insert
  const leads = Array.isArray(body) ? body : [body];

  const rows = leads.map((l) => ({
    company: l.company,
    contact: l.contact || null,
    role: l.role || null,
    email: l.email || null,
    city: l.city || null,
    store_type: l.store_type || l.storeType || null,
    employees: l.employees || null,
    stage: l.stage || 'scraped',
    score: l.score || 50,
    emails_sent: l.emails_sent || 0,
    last_action: l.last_action || l.lastAction || 'Gescraped door research agent',
    source: l.source || 'Market Research Agent',
    notes: l.notes || null,
    sequence: l.sequence || 0,
    next_follow_up: l.next_follow_up || null,
  }));

  const { data, error } = await supabase
    .from('leads')
    .upsert(rows, { onConflict: 'company' })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH — update a lead (stage change, etc.)
export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id verplicht' }, { status: 400 });
  }

  const { error } = await supabase
    .from('leads')
    .update({ ...updates, last_action_date: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
