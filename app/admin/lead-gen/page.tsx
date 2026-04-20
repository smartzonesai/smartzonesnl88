'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ================================================================ */
/*  Types                                                            */
/* ================================================================ */

interface Lead {
  id: number;
  company: string;
  contact: string;
  role: string;
  email: string;
  city: string;
  storeType: string;
  employees: string;
  stage: keyof typeof STAGES;
  score: number;
  emailsSent: number;
  lastAction: string;
  lastActionDate: string;
  source: string;
  notes: string;
  sequence: number;
  nextFollowUp: string | null;
}

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STAGES = {
  scraped: { label: 'Gescraped', color: '#34A853', group: 'data' },
  enriched: { label: 'Verrijkt', color: '#2D8A4E', group: 'data' },
  contacted: { label: 'Benaderd', color: '#4A9EE5', group: 'outreach' },
  opened: { label: 'Geopend', color: '#F5A623', group: 'outreach' },
  clicked: { label: 'Geklikt', color: '#E87A2E', group: 'outreach' },
  replied: { label: 'Beantwoord', color: '#E8644A', group: 'response' },
  meeting: { label: 'Demo', color: '#34D399', group: 'conversion' },
  converted: { label: 'Klant', color: '#22C55E', group: 'conversion' },
  retargeting: { label: 'Retargeting', color: '#8B5CF6', group: 'outreach' },
  nurture: { label: 'Nurture', color: '#6366F1', group: 'outreach' },
  lost: { label: 'Verloren', color: '#6B7280', group: 'other' },
} as const;

const AGENTS = [
  { id: 'research', name: 'Market Research Agent', desc: 'Scrape kleine retailers (1-5 medewerkers)', color: '#34A853', icon: '🔍', status: 'active' as const },
  { id: 'enrichment', name: 'Enrichment Agent', desc: 'Vind founder/CEO/GM contactgegevens', color: '#2D8A4E', icon: '📊', status: 'active' as const },
  { id: 'outreach', name: 'Outreach Agent', desc: 'Verstuur eerste cold email', color: '#4A9EE5', icon: '📧', status: 'active' as const },
  { id: 'followup', name: 'Follow-up Agent', desc: 'Stuur follow-up bij geen reactie', color: '#E87A2E', icon: '🔄', status: 'active' as const },
  { id: 'reply', name: 'AI Reply Agent', desc: 'Beantwoord vragen van leads', color: '#E8644A', icon: '💬', status: 'active' as const },
  { id: 'retargeting', name: 'Retargeting Agent', desc: 'Cookie tracking + social media ads', color: '#8B5CF6', icon: '🎯', status: 'paused' as const },
  { id: 'nurture', name: 'Nurture Agent', desc: 'Langetermijn drip sequentie', color: '#6366F1', icon: '🌱', status: 'active' as const },
];

/* ─── Helper: map DB row to Lead ─── */
function dbRowToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as number,
    company: (row.company as string) || '',
    contact: (row.contact as string) || '',
    role: (row.role as string) || '',
    email: (row.email as string) || '',
    city: (row.city as string) || '',
    storeType: (row.store_type as string) || '',
    employees: (row.employees as string) || '',
    stage: (row.stage as Lead['stage']) || 'scraped',
    score: (row.score as number) || 50,
    emailsSent: (row.emails_sent as number) || 0,
    lastAction: (row.last_action as string) || '',
    lastActionDate: row.last_action_date ? new Date(row.last_action_date as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    source: (row.source as string) || '',
    notes: (row.notes as string) || '',
    sequence: (row.sequence as number) || 0,
    nextFollowUp: (row.next_follow_up as string) || null,
  };
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

/* ================================================================ */
/*  Pipeline Flow Diagram                                            */
/* ================================================================ */

function PipelineFlow({ leads }: { leads: Lead[] }) {
  const stageCount = (stages: string[]) => leads.filter(l => stages.includes(l.stage)).length;

  const nodes = [
    { label: 'Market Research', sub: `${stageCount(['scraped'])} leads`, color: '#34A853', group: 'Data agents' },
    { label: 'Enrichment', sub: `${stageCount(['enriched'])} verrijkt`, color: '#2D8A4E', group: 'Data agents' },
    { label: 'Outreach', sub: `${stageCount(['contacted'])} benaderd`, color: '#4A9EE5', group: 'Outreach agents' },
    { label: 'Email Tracked', sub: '', color: '#F5A623', group: 'decision', isDiamond: true },
    { label: 'Follow-up', sub: `${stageCount(['opened'])} follow-ups`, color: '#E87A2E', group: 'Response agents' },
    { label: 'AI Reply', sub: `${stageCount(['replied'])} beantwoord`, color: '#E8644A', group: 'Response agents' },
    { label: 'Converted?', sub: `${stageCount(['clicked'])} geklikt`, color: '#34D399', group: 'decision', isDiamond: true },
    { label: 'Retargeting', sub: `${stageCount(['retargeting'])} actief`, color: '#8B5CF6', group: 'Outreach agents' },
    { label: 'Nurture Queue', sub: `${stageCount(['nurture'])} in drip`, color: '#6366F1', group: 'Outreach agents' },
  ];

  return (
    <div style={{ ...cardStyle, marginBottom: '1.5rem', overflow: 'hidden' }}>
      <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>
        Agent Pipeline Flow
      </h3>

      {/* Visual flow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
        {/* Row 1: Research → Enrichment → Outreach */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {nodes.slice(0, 3).map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FlowNode {...n} />
              {i < 2 && <FlowArrow />}
            </div>
          ))}
        </div>

        <FlowArrowDown />

        {/* Row 2: Email tracked (diamond) */}
        <FlowNode label="Email Tracked" sub="Opens, clicks, replies" color="#F5A623" isDiamond />

        {/* Row 3: Three branches */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
          {/* Left: Follow-up */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.35)' }}>Opened, no click</span>
            <FlowArrowDown small />
            <FlowNode label="Follow-up Agent" sub={`${stageCount(['opened'])} wachten`} color="#E87A2E" />
            <span style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.25)', marginTop: '0.2rem' }}>↩ Re-enters tracking</span>
          </div>

          {/* Center: Clicked → Converted? → Retargeting → Nurture */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.35)' }}>Opened + clicked</span>
            <FlowArrowDown small />
            <FlowNode label="Converted?" sub={`${stageCount(['meeting', 'converted'])} conversies`} color="#34D399" isDiamond />
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: '#34A853' }}>Ja →</span>
                <div style={{ padding: '0.3rem 0.6rem', background: 'rgba(34,197,94,0.15)', borderRadius: '6px', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22C55E' }}>Klant!</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.55rem', color: '#E53E3E' }}>Nee ↓</span>
                <FlowNode label="Retargeting" sub={`${stageCount(['retargeting'])} actief`} color="#8B5CF6" small />
                <FlowArrowDown small />
                <FlowNode label="Nurture Queue" sub={`${stageCount(['nurture'])} in drip`} color="#6366F1" small />
              </div>
            </div>
          </div>

          {/* Right: Reply */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.35)' }}>Reply received</span>
            <FlowArrowDown small />
            <FlowNode label="AI Reply Agent" sub={`${stageCount(['replied'])} actief`} color="#E8644A" />
            <span style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.25)', marginTop: '0.2rem' }}>↩ Re-enters tracking</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(232,228,220,0.04)', flexWrap: 'wrap' }}>
        {[
          { label: 'Data agents', color: '#34A853' },
          { label: 'Outreach agents', color: '#4A9EE5' },
          { label: 'Response agents', color: '#E8644A' },
          { label: 'Conversion', color: '#22C55E' },
          { label: 'Decision', color: '#F5A623' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, opacity: 0.6 }} />
            <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.4)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowNode({ label, sub, color, isDiamond, small }: { label: string; sub: string; color: string; isDiamond?: boolean; small?: boolean }) {
  return (
    <div style={{
      padding: small ? '0.45rem 0.75rem' : '0.6rem 1.1rem',
      borderRadius: isDiamond ? '4px' : '10px',
      border: `1.5px solid ${color}50`,
      background: `${color}10`,
      textAlign: 'center',
      transform: isDiamond ? 'rotate(0deg)' : undefined,
      minWidth: small ? '100px' : '130px',
    }}>
      <p style={{ fontSize: small ? '0.7rem' : '0.8rem', fontWeight: 700, color }}>{label}</p>
      {sub && <p style={{ fontSize: small ? '0.55rem' : '0.65rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.1rem' }}>{sub}</p>}
    </div>
  );
}

function FlowArrow() {
  return <span style={{ color: 'rgba(232,228,220,0.2)', fontSize: '1.2rem' }}>→</span>;
}

function FlowArrowDown({ small }: { small?: boolean }) {
  return <span style={{ color: 'rgba(232,228,220,0.2)', fontSize: small ? '0.9rem' : '1.2rem', lineHeight: 1 }}>↓</span>;
}

/* ================================================================ */
/*  Main Component                                                   */
/* ================================================================ */

export default function LeadGenPage() {
  const [tab, setTab] = useState<'pipeline' | 'leads' | 'agents'>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentMessages, setAgentMessages] = useState<Record<string, AgentMessage[]>>({});
  const [agentInput, setAgentInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsStageFilter, setLeadsStageFilter] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [agentMessages]);

  // Fetch leads from database
  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.map(dbRowToLead));
      }
    } catch { /* ignore */ }
    setLeadsLoading(false);
  }

  const stageCount = (stage: string) => leads.filter(l => l.stage === stage).length;
  const conversions = leads.filter(l => l.stage === 'converted').length;
  const conversionRate = leads.length > 0 ? Math.round((conversions / leads.length) * 100) : 0;

  const funnelData = [
    { stage: 'Gescraped', count: stageCount('scraped') },
    { stage: 'Verrijkt', count: stageCount('enriched') },
    { stage: 'Benaderd', count: stageCount('contacted') },
    { stage: 'Geopend', count: stageCount('opened') },
    { stage: 'Geklikt', count: stageCount('clicked') },
    { stage: 'Beantwoord', count: stageCount('replied') },
    { stage: 'Demo', count: stageCount('meeting') },
    { stage: 'Klant', count: stageCount('converted') },
  ];

  async function updateLeadStage(id: number, stage: string, lastAction?: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: stage as Lead['stage'], lastAction: lastAction || l.lastAction } : l));
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage, last_action: lastAction }),
    });
  }

  const runAgent = async (agentId: string, prompt?: string) => {
    const message = prompt || agentInput.trim();
    if (!message || agentLoading) return;
    setAgentInput('');
    setAgentMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { role: 'user', content: message }] }));
    setAgentLoading(true);

    try {
      const res = await fetch('/api/admin/lead-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          message,
          history: (agentMessages[agentId] || []).slice(-10),
          leads: leads.map(l => ({ company: l.company, stage: l.stage, storeType: l.storeType, score: l.score, contact: l.contact, notes: l.notes, emailsSent: l.emailsSent })),
        }),
      });
      const data = await res.json();
      setAgentMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { role: 'assistant', content: data.response || 'Error.' }] }));
    } catch {
      setAgentMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { role: 'assistant', content: 'Verbindingsfout.' }] }));
    }
    setAgentLoading(false);
  };

  const TABS = [
    { key: 'pipeline', label: 'Pipeline Overzicht' },
    { key: 'leads', label: `Leads (${leads.length})` },
    { key: 'agents', label: 'Agent Control Center' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>
          AI Lead Generation
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
          Geautomatiseerde pipeline van marktonderzoek tot conversie
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(232,228,220,0.06)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)} style={{
            padding: '0.75rem 1.25rem', fontSize: '0.85rem',
            fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? '#E87A2E' : 'rgba(232,228,220,0.5)',
            background: 'none', border: 'none',
            borderBottom: tab === t.key ? '2px solid #E87A2E' : '2px solid transparent',
            cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══════════════ PIPELINE TAB ═══════════════ */}
      {tab === 'pipeline' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Totaal Leads', value: leads.length, color: '#4A9EE5' },
              { label: 'In Pipeline', value: leads.filter(l => !['converted', 'lost'].includes(l.stage)).length, color: '#E87A2E' },
              { label: 'Geconverteerd', value: conversions, color: '#34A853' },
              { label: 'Conversie Rate', value: `${conversionRate}%`, color: '#F5A623' },
              { label: 'Pipeline Waarde', value: `€${leads.filter(l => !['converted', 'lost'].includes(l.stage)).length * 199}`, color: '#8B5CF6' },
            ].map((s, i) => (
              <div key={i} style={{ ...cardStyle, padding: '0.85rem 1rem', borderTop: `3px solid ${s.color}`, textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 800, color: '#E8E4DC', display: 'block' }}>{s.value}</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Flow Diagram */}
          <PipelineFlow leads={leads} />

          {/* Funnel Chart */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>
              Conversie Funnel
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.06)" />
                <XAxis type="number" stroke="rgba(232,228,220,0.3)" fontSize={12} />
                <YAxis type="category" dataKey="stage" stroke="rgba(232,228,220,0.3)" fontSize={11} width={80} />
                <Tooltip contentStyle={{ background: '#1A1917', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="count" fill="#E87A2E" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══════════════ LEADS TAB ═══════════════ */}
      {tab === 'leads' && (
        <div>
          {leadsLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(232,228,220,0.4)' }}>Leads laden...</p>
            </div>
          ) : leads.length === 0 ? (
            <div style={{ ...cardStyle, padding: '3rem 2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', color: 'rgba(232,228,220,0.5)', marginBottom: '0.75rem' }}>Nog geen leads in de pipeline</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.3)', marginBottom: '1.5rem' }}>Start de Market Research Agent om automatisch leads te vinden</p>
              <button onClick={() => { setTab('agents'); setSelectedAgent('research'); }}
                style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', background: '#E87A2E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                Research Agent starten →
              </button>
            </div>
          ) : (
          <div>
          {/* Stage filter chips */}
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {Object.entries(STAGES).map(([key, val]) => (
              <span key={key} style={{
                padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                background: `${val.color}15`, color: val.color, cursor: 'default',
              }}>
                {val.label} ({stageCount(key)})
              </span>
            ))}
          </div>

          {/* Leads table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* Zoek + filter */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                value={leadsSearch}
                onChange={e => setLeadsSearch(e.target.value)}
                placeholder="Zoeken op bedrijf, contact, stad..."
                style={{ flex: 1, minWidth: '200px', background: 'rgba(232,228,220,0.05)', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', padding: '0.55rem 0.85rem', color: '#E8E4DC', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
              />
              <select
                value={leadsStageFilter}
                onChange={e => setLeadsStageFilter(e.target.value)}
                style={{ background: 'rgba(232,228,220,0.05)', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', padding: '0.55rem 0.85rem', color: '#E8E4DC', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <option value="all">Alle fases</option>
                {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            {leads
              .filter(l => {
                const q = leadsSearch.toLowerCase();
                const matchSearch = !q || l.company.toLowerCase().includes(q) || l.contact.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
                const matchStage = leadsStageFilter === 'all' || l.stage === leadsStageFilter;
                return matchSearch && matchStage;
              })
              .sort((a, b) => b.score - a.score).map(lead => {
              const stage = STAGES[lead.stage];
              const isExpanded = expandedLead === lead.id;
              return (
                <div key={lead.id}>
                  <div
                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                    style={{
                      ...cardStyle, padding: '0.75rem 1rem', cursor: 'pointer',
                      display: 'grid', gridTemplateColumns: '1fr 70px 55px 80px 90px 24px',
                      alignItems: 'center', gap: '1rem',
                      borderLeft: `3px solid ${stage.color}`,
                      borderBottomLeftRadius: isExpanded ? 0 : '14px',
                      borderBottomRightRadius: isExpanded ? 0 : '14px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E4DC' }}>{lead.company}</p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)' }}>{lead.contact} · {lead.role} · {lead.city}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: '50%',
                        background: `conic-gradient(${lead.score >= 80 ? '#34A853' : lead.score >= 60 ? '#F5A623' : '#E53E3E'} ${lead.score * 3.6}deg, rgba(232,228,220,0.06) 0deg)`,
                      }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#1A1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#E8E4DC' }}>{lead.score}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(232,228,220,0.5)' }}>
                      {lead.emailsSent > 0 ? `${lead.emailsSent}x` : '—'}
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '0.2rem 0.45rem', borderRadius: '5px', background: `${stage.color}20`, color: stage.color, textAlign: 'center' }}>
                      {stage.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.3)' }}>
                      {new Date(lead.lastActionDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.2)', transform: isExpanded ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▼</span>
                  </div>

                  {isExpanded && (
                    <div style={{
                      background: 'rgba(20,19,17,0.7)', border: '1px solid rgba(232,228,220,0.06)', borderTop: 'none',
                      borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px', padding: '1.25rem',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          { label: 'Email', value: lead.email },
                          { label: 'Winkeltype', value: lead.storeType },
                          { label: 'Medewerkers', value: lead.employees },
                          { label: 'Bron', value: lead.source },
                          { label: 'Emails Verzonden', value: String(lead.emailsSent) },
                          { label: 'Laatste Actie', value: lead.lastAction },
                        ].map((f, i) => (
                          <div key={i}>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</span>
                            <p style={{ fontSize: '0.8rem', color: '#E8E4DC', marginTop: '0.1rem' }}>{f.value}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(232,228,220,0.02)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.3)', textTransform: 'uppercase' }}>Agent Notities</span>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.6)', marginTop: '0.15rem' }}>{lead.notes}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => { setSelectedAgent('outreach'); setTab('agents'); runAgent('outreach', `Schrijf een ${lead.emailsSent === 0 ? 'eerste cold' : 'follow-up'} email voor ${lead.company} (${lead.storeType}, ${lead.city}). Contact: ${lead.contact} (${lead.role}). Notes: ${lead.notes}`); }}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '7px', background: '#E87A2E', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                          {lead.emailsSent === 0 ? '📧 Genereer Cold Email' : '🔄 Genereer Follow-up'}
                        </button>
                        <button onClick={() => { setSelectedAgent('reply'); setTab('agents'); runAgent('reply', `Analyseer lead ${lead.company} en stel een antwoord op als ze vragen: "Wat kost het?" of "Hoe werkt het?". Context: ${lead.notes}`); }}
                          style={{ padding: '0.45rem 0.85rem', borderRadius: '7px', background: 'rgba(232,228,220,0.06)', color: 'rgba(232,228,220,0.6)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                          💬 AI Antwoord Voorbereiden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>
          )}
        </div>
      )}

      {/* ═══════════════ AGENTS TAB ═══════════════ */}
      {tab === 'agents' && (
        <AgentControlCenter
          agents={AGENTS}
          leads={leads}
          agentMessages={agentMessages}
          setAgentMessages={setAgentMessages}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          agentInput={agentInput}
          setAgentInput={setAgentInput}
          agentLoading={agentLoading}
          runAgent={runAgent}
          messagesEndRef={messagesEndRef}
        />
      )}

      <style>{`
        @keyframes dotP { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

/* ================================================================ */
/*  Agent Control Center (Autonomous 24/7)                           */
/* ================================================================ */

interface AgentConfig {
  agent_id: string;
  enabled: boolean;
  interval_minutes: number;
  last_run_at: string | null;
  next_run_at: string | null;
}

interface ActivityLog {
  id: number;
  agent_id: string;
  action: string;
  details: string;
  lead_company: string | null;
  created_at: string;
}

const INTERVAL_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 uur', value: 60 },
  { label: '2 uur', value: 120 },
  { label: '3 uur', value: 180 },
  { label: '6 uur', value: 360 },
  { label: '12 uur', value: 720 },
  { label: '24 uur', value: 1440 },
];

function AgentControlCenter({
  agents, leads, agentMessages, setAgentMessages, selectedAgent, setSelectedAgent,
  agentInput, setAgentInput, agentLoading, runAgent, messagesEndRef,
}: {
  agents: typeof AGENTS;
  leads: Lead[];
  agentMessages: Record<string, AgentMessage[]>;
  setAgentMessages: React.Dispatch<React.SetStateAction<Record<string, AgentMessage[]>>>;
  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;
  agentInput: string;
  setAgentInput: (v: string) => void;
  agentLoading: boolean;
  runAgent: (id: string, prompt?: string) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [view, setView] = useState<'control' | 'chat'>('control');

  // Fetch configs and activity
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/lead-gen/config');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
        setActivity(data.activity || []);
      }
    } catch { /* ignore */ }
    setLoadingConfigs(false);
  }

  async function toggleAgent(agentId: string, enabled: boolean) {
    setConfigs(prev => prev.map(c => c.agent_id === agentId ? { ...c, enabled } : c));
    await fetch('/api/admin/lead-gen/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, enabled }),
    });
    fetchData();
  }

  async function updateInterval(agentId: string, interval: number) {
    setConfigs(prev => prev.map(c => c.agent_id === agentId ? { ...c, interval_minutes: interval } : c));
    await fetch('/api/admin/lead-gen/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, interval_minutes: interval }),
    });
  }

  async function triggerAgent(agentId: string) {
    setRunningAgent(agentId);
    await fetch('/api/admin/lead-gen/cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    setRunningAgent(null);
    fetchData();
  }

  function getConfig(agentId: string): AgentConfig | undefined {
    return configs.find(c => c.agent_id === agentId);
  }

  function formatInterval(min: number): string {
    if (min < 60) return `${min} min`;
    if (min < 1440) return `${min / 60} uur`;
    return `${min / 1440} dag`;
  }

  function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Zojuist';
    if (min < 60) return `${min} min geleden`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} uur geleden`;
    return `${Math.floor(hr / 24)} dag geleden`;
  }

  function timeUntil(date: string): string {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return 'Nu';
    const min = Math.floor(diff / 60000);
    if (min < 60) return `Over ${min} min`;
    return `Over ${Math.floor(min / 60)} uur`;
  }

  const activeCount = configs.filter(c => c.enabled).length;

  return (
    <div>
      {/* Header with master controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: activeCount > 0 ? '#34A853' : '#E53E3E',
            boxShadow: activeCount > 0 ? '0 0 8px rgba(52,168,83,0.5)' : 'none',
            animation: activeCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
          }} />
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E4DC' }}>
              {activeCount}/{agents.length} agents actief
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)', display: 'block' }}>
              Autonome modus — agents draaien 24/7
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setView('control')} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
            background: view === 'control' ? '#E87A2E' : 'rgba(232,228,220,0.06)',
            color: view === 'control' ? '#fff' : 'rgba(232,228,220,0.5)', border: 'none', cursor: 'pointer',
          }}>Controle Paneel</button>
          <button onClick={() => setView('chat')} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
            background: view === 'chat' ? '#E87A2E' : 'rgba(232,228,220,0.06)',
            color: view === 'chat' ? '#fff' : 'rgba(232,228,220,0.5)', border: 'none', cursor: 'pointer',
          }}>Handmatige Chat</button>
        </div>
      </div>

      {view === 'control' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Left: Agent cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.25rem' }}>
              Agent Status & Schema
            </h3>
            {agents.map(agent => {
              const config = getConfig(agent.id);
              const isEnabled = config?.enabled ?? false;
              const isRunning = runningAgent === agent.id;
              const lastRun = config?.last_run_at;
              const nextRun = config?.next_run_at;

              return (
                <div key={agent.id} style={{
                  ...cardStyle, padding: '1rem 1.25rem',
                  borderLeft: `3px solid ${isEnabled ? agent.color : 'rgba(232,228,220,0.1)'}`,
                  opacity: isEnabled ? 1 : 0.6,
                  transition: 'all 0.3s',
                }}>
                  {/* Row 1: Name + Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{agent.icon}</span>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8E4DC' }}>{agent.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', display: 'block' }}>{agent.desc}</span>
                      </div>
                    </div>
                    {/* Toggle switch */}
                    <button
                      onClick={() => toggleAgent(agent.id, !isEnabled)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: isEnabled ? '#34A853' : 'rgba(232,228,220,0.15)',
                        position: 'relative', transition: 'background 0.3s', flexShrink: 0,
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: isEnabled ? 23 : 3,
                        transition: 'left 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </button>
                  </div>

                  {/* Row 2: Schedule + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Interval selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.3)' }}>Elke</span>
                      <select
                        value={config?.interval_minutes || 60}
                        onChange={e => updateInterval(agent.id, Number(e.target.value))}
                        style={{
                          padding: '0.25rem 0.4rem', background: 'rgba(26,25,23,0.7)',
                          border: '1px solid rgba(232,228,220,0.1)', borderRadius: '5px',
                          color: '#E8E4DC', fontSize: '0.7rem', outline: 'none',
                        }}
                      >
                        {INTERVAL_OPTIONS.map(o => (
                          <option key={o.value} value={o.value} style={{ background: '#1A1917' }}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Last run */}
                    {lastRun && (
                      <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.3)' }}>
                        Laatste: {timeAgo(lastRun)}
                      </span>
                    )}

                    {/* Next run */}
                    {isEnabled && nextRun && (
                      <span style={{ fontSize: '0.65rem', color: agent.color, fontWeight: 600 }}>
                        Volgende: {timeUntil(nextRun)}
                      </span>
                    )}

                    {/* Manual trigger */}
                    <button
                      onClick={() => triggerAgent(agent.id)}
                      disabled={isRunning}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                        background: isRunning ? 'rgba(232,228,220,0.06)' : `${agent.color}20`,
                        color: isRunning ? 'rgba(232,228,220,0.3)' : agent.color,
                        border: 'none', cursor: isRunning ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      {isRunning ? (
                        <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'dotP 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Draait...</>
                      ) : (
                        '▶ Nu draaien'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Activity Log */}
          <ActivityLog
            activity={activity}
            agents={agents}
            loadingConfigs={loadingConfigs}
            timeAgo={timeAgo}
            cardStyle={cardStyle}
          />
        </div>
      )}

      {/* Chat view — manual override for any agent */}
      {view === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '240px 1fr' : '1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: selectedAgent ? 'column' : 'row', gap: '0.4rem', flexWrap: 'wrap' }}>
            {agents.map(agent => (
              <div key={agent.id} onClick={() => setSelectedAgent(agent.id)} style={{
                ...cardStyle, padding: '0.65rem 0.85rem', cursor: 'pointer',
                borderLeft: `3px solid ${agent.color}`,
                background: selectedAgent === agent.id ? `${agent.color}10` : cardStyle.background,
                flex: selectedAgent ? undefined : '1 1 180px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{agent.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E8E4DC' }}>{agent.name}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedAgent && (
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 300px)', padding: 0 }}>
              <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid rgba(232,228,220,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{agents.find(a => a.id === selectedAgent)?.icon}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E4DC' }}>{agents.find(a => a.id === selectedAgent)?.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.3)', marginLeft: '0.25rem' }}>Handmatige modus</span>
                </div>
                <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', color: 'rgba(232,228,220,0.3)', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {!(agentMessages[selectedAgent]?.length) ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.3)', marginBottom: '1rem' }}>Geef een handmatige opdracht</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxWidth: '380px', margin: '0 auto' }}>
                      {getAgentPrompts(selectedAgent).map((p, i) => (
                        <button key={i} onClick={() => runAgent(selectedAgent, p)} style={{
                          padding: '0.5rem 0.7rem', borderRadius: '7px', textAlign: 'left',
                          background: 'rgba(232,228,220,0.03)', border: '1px solid rgba(232,228,220,0.06)',
                          color: 'rgba(232,228,220,0.45)', fontSize: '0.75rem', cursor: 'pointer',
                        }}>{p}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(agentMessages[selectedAgent] || []).map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '85%', padding: '0.65rem 0.85rem',
                          borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                          background: msg.role === 'user' ? '#E87A2E' : 'rgba(232,228,220,0.06)',
                          color: msg.role === 'user' ? '#fff' : 'rgba(232,228,220,0.8)',
                          fontSize: '0.8rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        }}>{msg.content}</div>
                      </div>
                    ))}
                    {agentLoading && (
                      <div style={{ display: 'flex', gap: '0.3rem', padding: '0.3rem' }}>
                        {[0, 1, 2].map(i => (<div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E87A2E', animation: `dotP 1.4s ease-in-out ${i * 0.2}s infinite` }} />))}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div style={{ padding: '0.65rem 0.85rem', borderTop: '1px solid rgba(232,228,220,0.06)', display: 'flex', gap: '0.4rem' }}>
                <textarea value={agentInput} onChange={e => setAgentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runAgent(selectedAgent); } }}
                  placeholder="Handmatige opdracht..." rows={1}
                  style={{ flex: 1, padding: '0.55rem 0.7rem', background: 'rgba(26,25,23,0.7)', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '7px', color: '#E8E4DC', fontSize: '0.8rem', outline: 'none', resize: 'none', minHeight: '36px', fontFamily: 'inherit' }} />
                <button onClick={() => runAgent(selectedAgent)} disabled={agentLoading || !agentInput.trim()} style={{
                  padding: '0.55rem 0.8rem', borderRadius: '7px',
                  background: agentInput.trim() && !agentLoading ? '#E87A2E' : 'rgba(232,228,220,0.06)',
                  color: agentInput.trim() && !agentLoading ? '#fff' : 'rgba(232,228,220,0.3)',
                  border: 'none', cursor: agentInput.trim() && !agentLoading ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.75rem',
                }}>Run</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  Activity Log with expand/fullscreen                              */
/* ================================================================ */

function ActivityLog({
  activity, agents, loadingConfigs, timeAgo, cardStyle,
}: {
  activity: ActivityLog[];
  agents: typeof AGENTS;
  loadingConfigs: boolean;
  timeAgo: (d: string) => string;
  cardStyle: React.CSSProperties;
}) {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [fullscreenLog, setFullscreenLog] = useState<ActivityLog | null>(null);

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.5rem' }}>
        Activiteiten Log (Live)
      </h3>
      <div style={{ ...cardStyle, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', padding: 0 }}>
        {activity.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.3)' }}>
              {loadingConfigs ? 'Laden...' : 'Nog geen activiteit. Start een agent om te beginnen.'}
            </p>
          </div>
        ) : (
          <div>
            {activity.map((log, i) => {
              const agent = agents.find(a => a.id === log.agent_id);
              const isExpanded = expandedLog === (log.id || i);
              const isLong = (log.details?.length || 0) > 150;

              return (
                <div
                  key={log.id || i}
                  onClick={() => setExpandedLog(isExpanded ? null : (log.id || i))}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderBottom: '1px solid rgba(232,228,220,0.03)',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    cursor: isLong ? 'pointer' : 'default',
                    background: isExpanded ? 'rgba(232,228,220,0.02)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '0.1rem' }}>{agent?.icon || '🤖'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: agent?.color || '#E8E4DC' }}>
                        {agent?.name || log.agent_id}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.25)' }}>·</span>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.25)' }}>
                        {timeAgo(log.created_at)}
                      </span>
                      {isLong && !isExpanded && (
                        <span style={{ fontSize: '0.6rem', color: 'rgba(232,122,46,0.5)', marginLeft: 'auto' }}>
                          Klik om te vergroten
                        </span>
                      )}
                    </div>

                    {/* Collapsed: truncated */}
                    {!isExpanded && (
                      <p style={{
                        fontSize: '0.75rem', color: 'rgba(232,228,220,0.5)', lineHeight: 1.5,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const,
                      }}>
                        {log.details}
                      </p>
                    )}

                    {/* Expanded: full text */}
                    {isExpanded && (
                      <div>
                        <p style={{
                          fontSize: '0.8rem', color: 'rgba(232,228,220,0.7)', lineHeight: 1.7,
                          whiteSpace: 'pre-wrap', marginBottom: '0.75rem',
                        }}>
                          {log.details}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFullscreenLog(log); }}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                            background: 'rgba(232,122,46,0.1)', color: '#E87A2E',
                            border: '1px solid rgba(232,122,46,0.2)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                          Volledig scherm
                        </button>
                      </div>
                    )}

                    {log.lead_company && (
                      <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.3)', marginTop: '0.15rem', display: 'block' }}>
                        Lead: {log.lead_company}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreenLog && (
        <div
          onClick={() => setFullscreenLog(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '800px', maxHeight: '85vh',
              background: '#141311',
              border: '1px solid rgba(232,228,220,0.1)',
              borderRadius: '16px',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(232,228,220,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{agents.find(a => a.id === fullscreenLog.agent_id)?.icon || '🤖'}</span>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#E8E4DC' }}>
                    {agents.find(a => a.id === fullscreenLog.agent_id)?.name || fullscreenLog.agent_id}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)' }}>
                    {new Date(fullscreenLog.created_at).toLocaleString('nl-NL', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {fullscreenLog.lead_company && ` · Lead: ${fullscreenLog.lead_company}`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(fullscreenLog.details || '')}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600,
                    background: 'rgba(232,228,220,0.06)', color: 'rgba(232,228,220,0.5)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Kopieer
                </button>
                <button
                  onClick={() => setFullscreenLog(null)}
                  style={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: 'rgba(232,228,220,0.06)', border: 'none',
                    color: 'rgba(232,228,220,0.5)', cursor: 'pointer',
                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body — full AI reasoning */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(232,228,220,0.75)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-body, inherit)',
              }}>
                {fullscreenLog.details}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(232,228,220,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.25)' }}>
                Actie: {fullscreenLog.action} · {fullscreenLog.details?.length || 0} tekens
              </span>
              <button
                onClick={() => setFullscreenLog(null)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px',
                  background: '#E87A2E', color: '#fff', border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                }}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Agent-specific prompts ─── */
function getAgentPrompts(agentId: string): string[] {
  const prompts: Record<string, string[]> = {
    research: [
      'Zoek 10 modewinkels in Amsterdam met 1-5 medewerkers',
      'Scrape kleine supermarkten in Noord-Brabant',
      'Vind recent geopende woonwinkels in de Randstad',
      'Identificeer electronicazaken die recent verbouwd zijn',
    ],
    enrichment: [
      'Verrijk de nieuw gescrapete leads met contactgegevens',
      'Zoek de eigenaar/CEO van Zara Home Utrecht',
      'Vind LinkedIn profielen voor alle leads zonder email',
      'Controleer welke emails bounced en zoek alternatieven',
    ],
    outreach: [
      'Genereer cold emails voor alle verrijkte leads',
      'Schrijf een eerste email voor Bijenkorf Amsterdam',
      'Maak een 4-staps email sequence voor modewinkels',
      'Genereer een gepersonaliseerde email voor elke nieuwe lead',
    ],
    followup: [
      'Welke leads hebben een follow-up nodig?',
      'Genereer follow-up emails voor alle geopende leads',
      'Schrijf een urgente follow-up voor leads die 2x geopend hebben',
      'Maak een re-engagement email voor leads in nurture',
    ],
    reply: [
      'Beantwoord: "Wat kost het en hoe werkt het?"',
      'Beantwoord: "Hebben jullie referenties in mijn branche?"',
      'Beantwoord: "Kan ik een gratis demo krijgen?"',
      'Maak template antwoorden voor de 5 meest gestelde vragen',
    ],
    retargeting: [
      'Welke leads moeten in retargeting?',
      'Stel Facebook retargeting audiences voor',
      'Maak Instagram ad copy voor geklickte maar niet-geconverteerde leads',
      'Analyseer welke retargeting kanalen het beste werken',
    ],
    nurture: [
      'Welke leads zitten in de nurture queue?',
      'Genereer een 6-maanden drip sequence',
      'Schrijf een seizoensgebonden re-activatie email',
      'Maak een waardevolle newsletter voor nurture leads',
    ],
  };
  return prompts[agentId] || ['Geef een opdracht...'];
}
