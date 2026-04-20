import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET — fetch all agent configs + recent activity
export async function GET() {
  const [{ data: configs }, { data: activity }] = await Promise.all([
    supabase.from('agent_config').select('*'),
    supabase.from('agent_activity').select('*').order('created_at', { ascending: false }).limit(50),
  ]);

  return NextResponse.json({ configs: configs || [], activity: activity || [] });
}

// PATCH — update agent config (toggle, interval)
export async function PATCH(request: NextRequest) {
  const { agentId, enabled, interval_minutes } = await request.json();

  if (!agentId) {
    return NextResponse.json({ error: 'agentId verplicht' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof enabled === 'boolean') update.enabled = enabled;
  if (typeof interval_minutes === 'number') update.interval_minutes = interval_minutes;

  // If enabling, set next_run to now so it runs immediately
  if (enabled === true) {
    update.next_run_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('agent_config')
    .update(update)
    .eq('agent_id', agentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
