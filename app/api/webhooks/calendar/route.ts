import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Cal.com webhook handler.
 * When a meeting is booked, update the lead's stage to "meeting".
 * Configure in Cal.com: POST https://yourdomain.com/api/webhooks/calendar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { triggerEvent, payload } = body;

    if (triggerEvent === 'BOOKING_CREATED') {
      const attendeeEmail = payload?.attendees?.[0]?.email;

      if (attendeeEmail) {
        // Find lead by email
        const { data: lead } = await supabase
          .from('leads')
          .select('id, company')
          .eq('email', attendeeEmail)
          .single();

        if (lead) {
          await supabase
            .from('leads')
            .update({
              stage: 'meeting',
              last_action: `Demo ingepland via Cal.com`,
              last_action_date: new Date().toISOString(),
            })
            .eq('id', lead.id);

          // Log activity
          await supabase.from('agent_activity').insert({
            agent_id: 'calendar',
            action: 'meeting_booked',
            details: `📅 Demo ingepland met ${lead.company} (${attendeeEmail})`,
            lead_company: lead.company,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
