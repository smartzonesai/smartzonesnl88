import { supabase } from './supabase';

/**
 * Anti-spam guard for outreach emails.
 * Enforces daily limits, per-lead cooldowns, and warmup schedules.
 */

const DEFAULT_DAILY_LIMIT = 10;
const WARMUP_WEEKS = [10, 25, 50, 75, 100]; // emails/day per warmup week
const MIN_HOURS_BETWEEN_EMAILS = 48;

/**
 * Calculate the current daily send limit based on warmup schedule.
 */
export async function getWarmupLimit(): Promise<number> {
  const { data } = await supabase
    .from('agent_config')
    .select('settings')
    .eq('agent_id', 'outreach')
    .single();

  const settings = (data?.settings || {}) as Record<string, unknown>;
  const warmupStart = settings.warmup_start_date as string | undefined;
  const customLimit = settings.daily_limit as number | undefined;

  if (customLimit) return customLimit;
  if (!warmupStart) return DEFAULT_DAILY_LIMIT;

  const startDate = new Date(warmupStart);
  const now = new Date();
  const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

  if (weeksSinceStart < 0) return DEFAULT_DAILY_LIMIT;
  if (weeksSinceStart >= WARMUP_WEEKS.length) return WARMUP_WEEKS[WARMUP_WEEKS.length - 1];

  return WARMUP_WEEKS[weeksSinceStart];
}

/**
 * Check how many emails were sent today.
 */
export async function getEmailsSentToday(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('email_log')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', today.toISOString());

  return count || 0;
}

/**
 * Check if we can still send emails today (under the daily limit).
 */
export async function canSendToday(): Promise<{ allowed: boolean; sent: number; limit: number }> {
  const [sent, limit] = await Promise.all([getEmailsSentToday(), getWarmupLimit()]);
  return { allowed: sent < limit, sent, limit };
}

/**
 * Check if enough time has passed since the last email to this lead.
 */
export async function canSendToLead(leadId: number): Promise<{ allowed: boolean; hoursSinceLastEmail: number | null }> {
  const { data } = await supabase
    .from('email_log')
    .select('sent_at')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return { allowed: true, hoursSinceLastEmail: null };
  }

  const lastSent = new Date(data.sent_at);
  const now = new Date();
  const hoursSince = (now.getTime() - lastSent.getTime()) / (60 * 60 * 1000);

  return {
    allowed: hoursSince >= MIN_HOURS_BETWEEN_EMAILS,
    hoursSinceLastEmail: Math.round(hoursSince),
  };
}

/**
 * Full pre-send check: daily limit + per-lead cooldown.
 */
export async function canSendEmail(leadId: number): Promise<{
  allowed: boolean;
  reason?: string;
  dailySent: number;
  dailyLimit: number;
}> {
  const daily = await canSendToday();
  if (!daily.allowed) {
    return {
      allowed: false,
      reason: `Daglimiet bereikt (${daily.sent}/${daily.limit}). Warmup-schema actief.`,
      dailySent: daily.sent,
      dailyLimit: daily.limit,
    };
  }

  const lead = await canSendToLead(leadId);
  if (!lead.allowed) {
    return {
      allowed: false,
      reason: `Te recent verstuurd (${lead.hoursSinceLastEmail}u geleden, minimum ${MIN_HOURS_BETWEEN_EMAILS}u).`,
      dailySent: daily.sent,
      dailyLimit: daily.limit,
    };
  }

  return { allowed: true, dailySent: daily.sent, dailyLimit: daily.limit };
}

/**
 * Start the warmup schedule from today.
 */
export async function startWarmup(): Promise<void> {
  await supabase
    .from('agent_config')
    .update({
      settings: {
        warmup_start_date: new Date().toISOString(),
      },
    })
    .eq('agent_id', 'outreach');
}
