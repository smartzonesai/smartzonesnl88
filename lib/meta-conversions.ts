import { createHash } from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const API_VERSION = 'v18.0';

interface EventData {
  email: string;
  eventName: 'ViewContent' | 'Lead' | 'Purchase' | 'InitiateCheckout';
  value?: number;
  currency?: string;
}

/**
 * Send a server-side event to Meta Conversions API.
 * Used for retargeting leads who engaged with emails but didn't convert.
 */
export async function sendMetaEvent(data: EventData): Promise<boolean> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.log('[Meta Conversions] No PIXEL_ID or ACCESS_TOKEN configured, skipping.');
    return false;
  }

  const hashedEmail = createHash('sha256').update(data.email.toLowerCase().trim()).digest('hex');
  const eventTime = Math.floor(Date.now() / 1000);

  const payload = {
    data: [
      {
        event_name: data.eventName,
        event_time: eventTime,
        action_source: 'email',
        user_data: {
          em: [hashedEmail],
        },
        custom_data: {
          value: data.value || 199,
          currency: data.currency || 'EUR',
          content_name: 'Smart Zones Winkelanalyse',
        },
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Meta Conversions] Error:', await response.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Meta Conversions] Failed:', err);
    return false;
  }
}

/**
 * Track email open as ViewContent event.
 */
export async function trackEmailOpen(email: string): Promise<boolean> {
  return sendMetaEvent({ email, eventName: 'ViewContent' });
}

/**
 * Track email click as Lead event.
 */
export async function trackEmailClick(email: string): Promise<boolean> {
  return sendMetaEvent({ email, eventName: 'Lead' });
}

/**
 * Track conversion (analysis purchased) as Purchase event.
 */
export async function trackConversion(email: string, value = 199): Promise<boolean> {
  return sendMetaEvent({ email, eventName: 'Purchase', value });
}
