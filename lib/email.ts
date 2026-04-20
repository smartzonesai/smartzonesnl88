import { Resend } from 'resend';
import { supabase } from './supabase';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
  }
  return _resend;
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  leadId?: number;
  variant?: string;
  abTestId?: string;
  from?: string;
  replyTo?: string;
  isOutreach?: boolean; // If true, adds unsubscribe footer (wettelijk verplicht)
}

interface SendResult {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * Send an email via Resend and log it to the database.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendResult> {
  const {
    to,
    subject,
    body,
    leadId,
    variant,
    abTestId,
    from = 'Smart Zones <info@smartzones.nl>',
    replyTo = 'info@smartzones.nl',
  } = params;

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: [to],
      replyTo,
      subject,
      html: formatEmailHtml(subject, body, params.isOutreach),
    });

    if (error) {
      return { id: '', success: false, error: error.message };
    }

    const resendId = data?.id || '';

    // Log to database
    await supabase.from('email_log').insert({
      lead_id: leadId || null,
      resend_id: resendId,
      subject,
      body,
      status: 'sent',
      variant: variant || null,
      ab_test_id: abTestId || null,
    });

    // Update lead if provided
    if (leadId) {
      // Get current emails_sent count
      const { data: currentLead } = await supabase
        .from('leads')
        .select('emails_sent')
        .eq('id', leadId)
        .single();

      await supabase
        .from('leads')
        .update({
          emails_sent: (currentLead?.emails_sent || 0) + 1,
          last_action: `Email verstuurd: ${subject}`,
          last_action_date: new Date().toISOString(),
          stage: 'contacted',
        })
        .eq('id', leadId);
    }

    return { id: resendId, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout';
    return { id: '', success: false, error: message };
  }
}

/**
 * Get the status of a sent email from our log.
 */
export async function getEmailStatus(emailLogId: string) {
  const { data } = await supabase
    .from('email_log')
    .select('*')
    .eq('id', emailLogId)
    .single();
  return data;
}

/**
 * Get all emails sent to a specific lead.
 */
export async function getEmailsForLead(leadId: number) {
  const { data } = await supabase
    .from('email_log')
    .select('*')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: false });
  return data || [];
}

/**
 * Format plain text body into a simple branded HTML email.
 */
function formatEmailHtml(subject: string, body: string, isOutreach = false): string {
  const lines = body.split('\n').map(l =>
    l.trim() ? `<p style="margin:0 0 12px;color:#333;font-size:15px;line-height:1.6;">${l}</p>` : '<br/>'
  ).join('');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartzones.nl';

  // Unsubscribe footer — wettelijk verplicht voor outreach e-mails (CAN-SPAM / EU e-privacyrichtlijn)
  const unsubscribeFooter = isOutreach ? `
    <tr><td style="padding:16px 32px;border-top:1px solid #eee;">
      <p style="margin:0 0 6px;color:#999;font-size:12px;">
        Smart Zones B.V. — AI winkeloptimalisatie | <a href="${siteUrl}" style="color:#999;">smartzones.nl</a>
      </p>
      <p style="margin:0;color:#bbb;font-size:11px;">
        U ontvangt dit bericht omdat uw bedrijf mogelijk baat heeft bij onze diensten.
        <a href="${siteUrl}/uitschrijven?email={{email}}" style="color:#bbb;text-decoration:underline;">
          Klik hier om u af te melden
        </a> — wij respecteren uw keuze en verwijderen uw gegevens direct.
      </p>
    </td></tr>` : `
    <tr><td style="padding:16px 32px;border-top:1px solid #eee;">
      <p style="margin:0;color:#999;font-size:12px;">
        Smart Zones — AI winkeloptimalisatie | <a href="${siteUrl}" style="color:#999;">smartzones.nl</a>
      </p>
    </td></tr>`;

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr><td style="background:#E87A2E;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Smart Zones<span style="opacity:0.7;">.</span></h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">AI Winkeloptimalisatie</p>
        </td></tr>
        <tr><td style="padding:32px;">
          ${lines}
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <a href="${siteUrl}/dashboard" style="display:inline-block;padding:12px 24px;background:#E87A2E;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
            Naar uw dashboard →
          </a>
        </td></tr>
        ${unsubscribeFooter}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
