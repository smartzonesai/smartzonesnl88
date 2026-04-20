import { createHmac } from 'crypto';
import { supabase } from './supabase';

/**
 * Dispatch a webhook event to all registered endpoints.
 */
export async function dispatchWebhook(event: string, payload: Record<string, unknown>): Promise<void> {
  const { data: hooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('active', true)
    .contains('events', [event]);

  if (!hooks || hooks.length === 0) return;

  const timestamp = Date.now();

  for (const hook of hooks) {
    const body = JSON.stringify({ event, timestamp, data: payload });
    const signature = createHmac('sha256', hook.secret).update(body).digest('hex');

    try {
      await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SmartZones-Signature': signature,
          'X-SmartZones-Event': event,
          'X-SmartZones-Timestamp': String(timestamp),
        },
        body,
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      console.error(`[Webhook] Failed to deliver ${event} to ${hook.url}:`, err);
    }
  }
}
