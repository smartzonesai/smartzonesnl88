import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/unsubscribe
 * Body: { email: string }
 *
 * Marks a lead as unsubscribed so no further outreach emails are sent.
 * Required by EU e-privacy directive and CAN-SPAM for outreach emails.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    // Mark lead as unsubscribed in the leads table
    await supabase
      .from('leads')
      .update({
        stage: 'unsubscribed',
        last_action: 'Afgemeld via unsubscribe link',
        last_action_date: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim());

    // Also log to email_log if we can find a matching entry
    await supabase.from('email_log').insert({
      subject: 'UNSUBSCRIBE',
      body: `Gebruiker ${email} heeft zich afgemeld.`,
      status: 'unsubscribed',
      sent_at: new Date().toISOString(),
    });

    console.log(`[Unsubscribe] ${email} afgemeld`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Unsubscribe] Error:', err);
    return NextResponse.json({ error: 'Afmelden mislukt' }, { status: 500 });
  }
}
