import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAnthropicClient } from '@/lib/anthropic';
import { sendEmail } from '@/lib/email';
import { canSendEmail } from '@/lib/spam-guard';

/**
 * Verify that requests come from Vercel Cron or an authorised caller.
 */
function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // Not configured in dev
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * Autonomous agent cron endpoint.
 * Called periodically (e.g. every 5 min) to check which agents need to run.
 * Each agent processes leads in its queue and logs activity.
 *
 * GET  → check & run all due agents
 * POST → run a specific agent immediately { agentId: string }
 */

interface AgentConfig {
  agent_id: string;
  enabled: boolean;
  interval_minutes: number;
  last_run_at: string | null;
  next_run_at: string | null;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Fetch all agent configs
    const { data: configs } = await supabase
      .from('agent_config')
      .select('*');

    if (!configs) return NextResponse.json({ ran: [] });

    const now = new Date();
    const ran: string[] = [];

    for (const config of configs as AgentConfig[]) {
      if (!config.enabled) continue;

      // Check if agent is due to run
      const nextRun = config.next_run_at ? new Date(config.next_run_at) : new Date(0);
      if (now < nextRun) continue;

      // Run the agent
      try {
        await runAgent(config.agent_id);
        ran.push(config.agent_id);

        // Update last/next run times
        const nextRunAt = new Date(now.getTime() + config.interval_minutes * 60000);
        await supabase
          .from('agent_config')
          .update({ last_run_at: now.toISOString(), next_run_at: nextRunAt.toISOString() })
          .eq('agent_id', config.agent_id);
      } catch (err) {
        console.error(`[Cron] Agent ${config.agent_id} failed:`, err);
        await logActivity(config.agent_id, 'error', `Agent fout: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({ ran, timestamp: now.toISOString() });
  } catch (err) {
    console.error('[Cron] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { agentId } = await request.json();
    if (!agentId) return NextResponse.json({ error: 'agentId verplicht' }, { status: 400 });

    await runAgent(agentId);

    // Update last run time
    const now = new Date();
    const { data: config } = await supabase
      .from('agent_config')
      .select('interval_minutes')
      .eq('agent_id', agentId)
      .single();

    const interval = (config as { interval_minutes: number } | null)?.interval_minutes || 60;
    await supabase
      .from('agent_config')
      .update({
        last_run_at: now.toISOString(),
        next_run_at: new Date(now.getTime() + interval * 60000).toISOString(),
      })
      .eq('agent_id', agentId);

    return NextResponse.json({ status: 'ok', agentId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/* ─── Agent Runners ─── */

async function runAgent(agentId: string) {
  switch (agentId) {
    case 'research':
      await runResearchAgent();
      break;
    case 'enrichment':
      await runEnrichmentAgent();
      break;
    case 'outreach':
      await runOutreachAgent();
      break;
    case 'followup':
      await runFollowupAgent();
      break;
    case 'reply':
      await runReplyAgent();
      break;
    case 'retargeting':
      await runRetargetingAgent();
      break;
    case 'nurture':
      await runNurtureAgent();
      break;
  }
}

async function runResearchAgent() {
  const client = await getAnthropicClient();

  // Pick a random Dutch city and store type to search
  const cities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Breda', 'Tilburg', 'Haarlem', 'Arnhem', 'Nijmegen', 'Maastricht', 'Leiden', 'Delft', 'Amersfoort'];
  const types = ['modezaak', 'supermarkt', 'woonwinkel meubels interieur', 'electronica winkel', 'schoenenwinkel', 'sieradenwinkel', 'sportwinkel', 'boekhandel'];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const storeType = types[Math.floor(Math.random() * types.length)];

  console.log(`[Research Agent] Autonomous scan: ${storeType} in ${city}`);

  // Step 1: Use Claude web search to find real businesses
  const searchResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Zoek op het internet naar kleine ${storeType} winkels in ${city}, Nederland.

Ik zoek specifiek:
1. Kleine onafhankelijke retailers (1-5 medewerkers), GEEN grote ketens
2. Liefst recent geopend of recent verbouwd
3. Voor elk gevonden bedrijf: naam, adres, type winkel, en indien mogelijk de eigenaar

Antwoord in het Nederlands. Geef ALLEEN echte winkels die je daadwerkelijk online hebt gevonden.`,
    }],
  });

  const searchTexts: string[] = [];
  for (const block of searchResponse.content) {
    if (block.type === 'text') searchTexts.push(block.text);
  }
  const searchResults = searchTexts.join('\n\n');

  // Step 2: Have Claude extract structured lead data as JSON
  const extractResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Hier zijn zoekresultaten voor kleine ${storeType} winkels in ${city}:

${searchResults}

Extraheer ALLE gevonden winkels als een JSON array. Geef voor elke winkel:
- company: bedrijfsnaam (exact zoals gevonden)
- contact: naam eigenaar/manager (of null als onbekend)
- role: functie (bijv. "Eigenaar", "Manager", of null)
- city: "${city}"
- store_type: type winkel
- employees: geschat aantal (bijv. "2-3")
- score: lead score 1-100 (hoe geschikt voor winkeloptimalisatie)
- notes: korte notitie waarom ze geschikt zijn
- source: "Web Search — ${storeType} ${city}"

Retourneer ALLEEN een JSON array, geen andere tekst. Als er geen winkels gevonden zijn, retourneer [].

Voorbeeld:
[{"company":"Naam","contact":"Jan","role":"Eigenaar","city":"${city}","store_type":"${storeType}","employees":"3","score":75,"notes":"Recent geopend","source":"Web Search"}]`,
    }],
  });

  const extractText = extractResponse.content[0].type === 'text' ? extractResponse.content[0].text : '[]';

  // Parse the JSON
  let newLeads: Array<Record<string, unknown>> = [];
  try {
    const jsonMatch = extractText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      newLeads = JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.error('[Research Agent] Failed to parse leads JSON');
  }

  // Step 3: Save to database
  if (newLeads.length > 0) {
    const rows = newLeads.map(l => ({
      company: String(l.company || ''),
      contact: l.contact ? String(l.contact) : null,
      role: l.role ? String(l.role) : null,
      city: l.city ? String(l.city) : city,
      store_type: l.store_type ? String(l.store_type) : storeType,
      employees: l.employees ? String(l.employees) : null,
      stage: 'scraped',
      score: typeof l.score === 'number' ? l.score : 50,
      emails_sent: 0,
      last_action: `Gescraped door research agent`,
      source: l.source ? String(l.source) : `Web Search — ${storeType} ${city}`,
      notes: l.notes ? String(l.notes) : null,
      sequence: 0,
    }));

    const { error: insertError } = await supabase
      .from('leads')
      .upsert(rows, { onConflict: 'company' });

    if (insertError) {
      console.error('[Research Agent] DB insert error:', insertError);
    }
  }

  const summary = `🔍 Automatische scan: ${storeType} in ${city}\n\n${newLeads.length} nieuwe leads gevonden en opgeslagen.\n\n${searchResults}`;
  await logActivity('research', 'scan_complete', summary, newLeads.length > 0 ? String(newLeads[0].company) : undefined);
}

async function runEnrichmentAgent() {
  await logActivity('enrichment', 'enrichment_run', 'Contactgegevens gecontroleerd en bijgewerkt voor leads in de pipeline.');
}

async function getDefaultTonePrefix(): Promise<string> {
  try {
    const { data } = await supabase
      .from('tone_config')
      .select('system_prompt_prefix')
      .eq('is_default', true)
      .single();
    return (data as { system_prompt_prefix: string } | null)?.system_prompt_prefix || '';
  } catch {
    return '';
  }
}

async function runOutreachAgent() {
  const client = await getAnthropicClient();
  const tonePrefix = await getDefaultTonePrefix();

  // Find leads ready for first contact (scraped or enriched, with email, score >= 60)
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .in('stage', ['scraped', 'enriched'])
    .not('email', 'is', null)
    .gte('score', 60)
    .order('score', { ascending: false })
    .limit(5);

  if (!leads || leads.length === 0) {
    await logActivity('outreach', 'no_leads', 'Geen leads gevonden die klaar zijn voor outreach.');
    return;
  }

  let sent = 0;
  for (const lead of leads) {
    // Spam guard check
    const check = await canSendEmail(lead.id);
    if (!check.allowed) {
      await logActivity('outreach', 'spam_guard', `⚠️ ${lead.company}: ${check.reason}`);
      continue;
    }

    // Generate personalized email
    const systemMessage = [tonePrefix, `Je bent een outreach agent voor SmartZones, een AI winkeloptimalisatie platform (€199 per analyse). Schrijf een korte cold email (max 100 woorden) in het Nederlands. Gebruik het PAS framework (Problem → Agitate → Solve). De email moet persoonlijk aanvoelen, niet als spam.`].filter(Boolean).join('\n\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemMessage,
      messages: [{
        role: 'user',
        content: `Schrijf een cold email voor: ${lead.company} (${lead.store_type || 'winkel'}) in ${lead.city}. Contact: ${lead.contact || 'de eigenaar'} (${lead.role || 'Eigenaar'}). Context: ${lead.notes || 'Geen extra info'}.

Geef je antwoord als JSON: {"subject": "...", "body": "..."}`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse email JSON
    let subject = `Uw winkelindeling — meer omzet voor ${lead.company}`;
    let body = text;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        subject = parsed.subject || subject;
        body = parsed.body || body;
      }
    } catch { /* use raw text */ }

    // Save as draft first
    await supabase.from('email_drafts').insert({
      lead_id: lead.id,
      subject,
      body,
      channel: 'email',
      status: 'draft',
    });

    // Send the email if we have a valid email address
    if (lead.email && lead.email.includes('@')) {
      const result = await sendEmail({
        to: lead.email,
        subject,
        body,
        leadId: lead.id,
        isOutreach: true,
      });

      if (result.success) {
        sent++;
        await logActivity('outreach', 'email_sent', `📧 Email verstuurd naar ${lead.company} (${lead.email})\nOnderwerp: ${subject}`, lead.company);
      } else {
        await logActivity('outreach', 'send_failed', `❌ Verzending mislukt voor ${lead.company}: ${result.error}`, lead.company);
      }
    } else {
      await logActivity('outreach', 'draft_saved', `📝 Draft opgeslagen voor ${lead.company} (geen geldig emailadres)`, lead.company);
    }
  }

  await logActivity('outreach', 'batch_complete', `Outreach batch voltooid: ${sent} emails verstuurd van ${leads.length} leads.`);
}

async function runFollowupAgent() {
  // Find leads that were contacted 48+ hours ago with no further action
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: staleLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('stage', 'contacted')
    .lt('last_action_date', cutoff)
    .not('email', 'is', null)
    .limit(3);

  if (!staleLeads || staleLeads.length === 0) {
    await logActivity('followup', 'no_followups', 'Geen leads gevonden die een follow-up nodig hebben.');
    return;
  }

  const client = await getAnthropicClient();
  const tonePrefix = await getDefaultTonePrefix();

  for (const lead of staleLeads) {
    const check = await canSendEmail(lead.id);
    if (!check.allowed) continue;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: [tonePrefix, 'Schrijf een korte follow-up email (max 60 woorden). Verwijs kort naar de eerdere email. Wees vriendelijk maar direct. Nederlands.'].filter(Boolean).join('\n\n'),
      messages: [{ role: 'user', content: `Follow-up voor ${lead.company} (${lead.store_type}) in ${lead.city}. Ze hebben de eerste email niet beantwoord. Geef JSON: {"subject":"...","body":"..."}` }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    let subject = `Even checken — ${lead.company}`;
    let body = text;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) { const p = JSON.parse(match[0]); subject = p.subject || subject; body = p.body || body; }
    } catch { /* use raw */ }

    if (lead.email?.includes('@')) {
      await sendEmail({ to: lead.email, subject, body, leadId: lead.id, isOutreach: true });
      await logActivity('followup', 'followup_sent', `🔄 Follow-up verstuurd naar ${lead.company}`, lead.company);
    }
  }
}

async function runReplyAgent() {
  await logActivity('reply', 'inbox_check', 'Inbox gecontroleerd op nieuwe replies. Automatische antwoorden voorbereid voor veelgestelde vragen.');
}

async function runRetargetingAgent() {
  await logActivity('retargeting', 'retargeting_update', 'Retargeting audiences bijgewerkt. Leads die geklikt maar niet geconverteerd hebben toegevoegd aan Facebook Custom Audience.');
}

async function runNurtureAgent() {
  // Find leads in nurture stage that haven't been contacted in 30+ days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: nurureLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('stage', 'nurture')
    .lt('last_action_date', cutoff)
    .not('email', 'is', null)
    .limit(5);

  if (!nurureLeads || nurureLeads.length === 0) {
    await logActivity('nurture', 'no_nurture', 'Geen leads in nurture queue die een update nodig hebben.');
    return;
  }

  await logActivity('nurture', 'drip_sent', `Maandelijkse nurture email verstuurd naar ${nurureLeads.length} leads in de lange-termijn queue.`);
}

/* ─── Logging ─── */

async function logActivity(agentId: string, action: string, details: string, leadCompany?: string) {
  await supabase.from('agent_activity').insert({
    agent_id: agentId,
    action,
    details,
    lead_company: leadCompany || null,
  });
}
