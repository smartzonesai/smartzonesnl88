import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Resend webhook handler for email events (open, click, bounce).
 * Configure in Resend dashboard: POST https://yourdomain.com/api/webhooks/resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!data?.email_id) {
      return NextResponse.json({ ok: true }); // Ignore events without email_id
    }

    const resendId = data.email_id;

    switch (type) {
      case 'email.opened': {
        await supabase
          .from('email_log')
          .update({ status: 'opened', opened_at: new Date().toISOString() })
          .eq('resend_id', resendId);

        // Update lead stage if applicable
        const { data: log } = await supabase
          .from('email_log')
          .select('lead_id')
          .eq('resend_id', resendId)
          .single();

        if (log?.lead_id) {
          await supabase
            .from('leads')
            .update({ stage: 'opened', last_action: 'Email geopend', last_action_date: new Date().toISOString() })
            .eq('id', log.lead_id)
            .in('stage', ['contacted']); // Only update if still in contacted stage
        }
        break;
      }

      case 'email.clicked': {
        await supabase
          .from('email_log')
          .update({ status: 'clicked', clicked_at: new Date().toISOString() })
          .eq('resend_id', resendId);

        const { data: log } = await supabase
          .from('email_log')
          .select('lead_id')
          .eq('resend_id', resendId)
          .single();

        if (log?.lead_id) {
          await supabase
            .from('leads')
            .update({ stage: 'clicked', last_action: 'Link geklikt in email', last_action_date: new Date().toISOString() })
            .eq('id', log.lead_id)
            .in('stage', ['contacted', 'opened']);
        }
        break;
      }

      case 'email.bounced': {
        await supabase
          .from('email_log')
          .update({ status: 'bounced', bounced_at: new Date().toISOString() })
          .eq('resend_id', resendId);

        const { data: log } = await supabase
          .from('email_log')
          .select('lead_id')
          .eq('resend_id', resendId)
          .single();

        if (log?.lead_id) {
          await supabase
            .from('leads')
            .update({ last_action: 'Email gebounced', last_action_date: new Date().toISOString() })
            .eq('id', log.lead_id);
        }
        break;
      }

      case 'email.delivered': {
        await supabase
          .from('email_log')
          .update({ status: 'delivered' })
          .eq('resend_id', resendId)
          .eq('status', 'sent'); // Only update if still in sent state
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always return 200 for webhooks
  }
}
