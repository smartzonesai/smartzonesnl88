'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ================================================================ */
/*  Types & Data                                                     */
/* ================================================================ */

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }
interface GeneratedEmail { subject: string; body: string; targetName: string; targetCompany: string }

interface Prospect {
  id: number;
  company: string;
  contact: string;
  email: string;
  city: string;
  storeType: string;
  stage: 'new' | 'contacted' | 'opened' | 'replied' | 'meeting' | 'converted' | 'lost';
  score: number;
  lastAction: string;
  notes: string;
  sequence: number; // which email in the sequence (0 = not started)
  nextFollowUp: string | null;
}

const PIPELINE_STAGES = [
  { key: 'new', label: 'Nieuw', color: '#8B5CF6' },
  { key: 'contacted', label: 'Benaderd', color: '#4A9EE5' },
  { key: 'opened', label: 'Geopend', color: '#F5A623' },
  { key: 'replied', label: 'Beantwoord', color: '#E87A2E' },
  { key: 'meeting', label: 'Demo', color: '#34D399' },
  { key: 'converted', label: 'Klant', color: '#34A853' },
  { key: 'lost', label: 'Verloren', color: '#E53E3E' },
] as const;

const initialProspects: Prospect[] = [
  { id: 1, company: 'Fashion House Amsterdam', contact: 'Emma van Berg', email: 'emma@fashionhouse.nl', city: 'Amsterdam', storeType: 'Mode', stage: 'meeting', score: 92, lastAction: 'Demo ingepland 20 mrt', notes: 'Zeer geïnteresseerd, 3 vestigingen', sequence: 3, nextFollowUp: null },
  { id: 2, company: 'DekaMarkt Haarlem', contact: 'Rob Dekker', email: 'rob@dekamarkt.nl', city: 'Haarlem', storeType: 'Supermarkt', stage: 'replied', score: 78, lastAction: 'Beantwoord: wil meer info', notes: 'Wil case study zien', sequence: 2, nextFollowUp: '2026-03-19' },
  { id: 3, company: 'Intratuin Hoofddorp', contact: 'Sarah Bloem', email: 'sarah@intratuin.nl', city: 'Hoofddorp', storeType: 'Woonwinkel', stage: 'contacted', score: 65, lastAction: 'Email 1 verzonden', notes: 'Grote winkeloppervlakte, hoog potentieel', sequence: 1, nextFollowUp: '2026-03-21' },
  { id: 4, company: 'MediaMarkt Eindhoven', contact: 'Tom Vries', email: 'tom@mediamarkt-local.nl', city: 'Eindhoven', storeType: 'Electronica', stage: 'opened', score: 71, lastAction: 'Email 2x geopend', notes: 'Franchise eigenaar', sequence: 1, nextFollowUp: '2026-03-20' },
  { id: 5, company: 'Zara Home Utrecht', contact: 'Laura Wit', email: 'laura@zarahome-ut.nl', city: 'Utrecht', storeType: 'Woonwinkel', stage: 'new', score: 85, lastAction: 'Geïdentificeerd via LinkedIn', notes: 'Recent verbouwd, perfecte timing', sequence: 0, nextFollowUp: null },
  { id: 6, company: 'Bakker Bart Groningen', contact: 'Kees Bakker', email: 'kees@bakkerbartgro.nl', city: 'Groningen', storeType: 'Overig', stage: 'new', score: 58, lastAction: 'Gevonden via KvK', notes: 'Klein maar groeiend', sequence: 0, nextFollowUp: null },
  { id: 7, company: 'CoolBlue Pop-up', contact: 'Pieter Zwart Jr.', email: 'stores@coolblue.nl', city: 'Rotterdam', storeType: 'Electronica', stage: 'contacted', score: 88, lastAction: 'LinkedIn bericht gestuurd', notes: '5 pop-up locaties gepland', sequence: 1, nextFollowUp: '2026-03-22' },
  { id: 8, company: 'HEMA Leidschendam', contact: 'Anne de Groot', email: 'anne@hema-franchise.nl', city: 'Leidschendam', storeType: 'Overig', stage: 'opened', score: 74, lastAction: 'Email geopend, geen reply', notes: 'Franchise eigenaar, 2 vestigingen', sequence: 2, nextFollowUp: '2026-03-19' },
  { id: 9, company: 'WE Fashion Breda', contact: 'Mark Jansen', email: 'mark@wefashion-breda.nl', city: 'Breda', storeType: 'Mode', stage: 'lost', score: 30, lastAction: 'Geen interesse momenteel', notes: 'Hercontact in Q3', sequence: 2, nextFollowUp: null },
  { id: 10, company: 'Albert Heijn XL Amstelveen', contact: 'Dirk Heijn', email: 'dirk@ah-amstelveen.nl', city: 'Amstelveen', storeType: 'Supermarkt', stage: 'converted', score: 95, lastAction: 'Analyse besteld!', notes: 'Nu klant, upsell mogelijkheden', sequence: 4, nextFollowUp: null },
  { id: 11, company: 'Bijenkorf Amsterdam', contact: 'Claire Dubois', email: 'claire@debijenkorf.nl', city: 'Amsterdam', storeType: 'Mode', stage: 'new', score: 96, lastAction: 'Top prospect geïdentificeerd', notes: 'Premium warenhuis, enorm potentieel', sequence: 0, nextFollowUp: null },
  { id: 12, company: 'Praxis Delft', contact: 'Henk Bouwer', email: 'henk@praxis-delft.nl', city: 'Delft', storeType: 'Woonwinkel', stage: 'replied', score: 69, lastAction: 'Vraagt om referenties', notes: 'Wil vergelijken met concurrent', sequence: 2, nextFollowUp: '2026-03-20' },
];

const outreachSequences = [
  { name: 'Mode Winkels — Introductie', emails: 4, avgOpen: 68, avgReply: 22, active: true, prospects: 15 },
  { name: 'Supermarkt Ketens — Case Study', emails: 3, avgOpen: 55, avgReply: 15, active: true, prospects: 8 },
  { name: 'Woonwinkels — Seizoensaanbieding', emails: 3, avgOpen: 72, avgReply: 28, active: false, prospects: 12 },
  { name: 'Electronica — Data-Driven Pitch', emails: 4, avgOpen: 61, avgReply: 18, active: true, prospects: 6 },
];

const weeklyOutreach = [
  { week: 'W8', sent: 12, opened: 8, replied: 3 },
  { week: 'W9', sent: 18, opened: 13, replied: 5 },
  { week: 'W10', sent: 22, opened: 16, replied: 6 },
  { week: 'W11', sent: 15, opened: 11, replied: 4 },
  { week: 'W12', sent: 25, opened: 19, replied: 8 },
];

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

/* ================================================================ */
/*  Component                                                        */
/* ================================================================ */

export default function OutreachPage() {
  const [tab, setTab] = useState<'pipeline' | 'campaigns' | 'agent'>('pipeline');
  const [prospects, setProspects] = useState(initialProspects);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const stageCount = (stage: string) => prospects.filter(p => p.stage === stage).length;
  const totalPipelineValue = prospects.filter(p => !['converted', 'lost'].includes(p.stage)).length * 199;

  const sendMessage = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;
    setInput('');
    setGeneratedEmail(null);
    setMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          prospects: prospects.map(p => ({ company: p.company, stage: p.stage, storeType: p.storeType, score: p.score, notes: p.notes })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Er ging iets mis.', timestamp: new Date() }]);
      if (data.email) setGeneratedEmail(data.email);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Verbindingsfout.', timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const moveProspect = (id: number, newStage: Prospect['stage']) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, stage: newStage } : p));
  };

  const TABS = [
    { key: 'pipeline', label: 'Prospect Pipeline', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { key: 'campaigns', label: 'Campagnes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { key: 'agent', label: 'AI Strategist', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>
          Cold Outreach Systeem
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
          Prospect pipeline, geautomatiseerde campagnes & AI-gestuurde strategie
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(232,228,220,0.06)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)} style={{
            padding: '0.75rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? '#E87A2E' : 'rgba(232,228,220,0.5)',
            background: 'none', border: 'none', whiteSpace: 'nowrap',
            borderBottom: tab === t.key ? '2px solid #E87A2E' : '2px solid transparent',
            cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ PIPELINE TAB ═══════════════ */}
      {tab === 'pipeline' && (
        <div>
          {/* Pipeline Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {PIPELINE_STAGES.filter(s => s.key !== 'lost').map(stage => (
              <div key={stage.key} style={{ ...cardStyle, padding: '0.85rem 1rem', borderTop: `3px solid ${stage.color}`, textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E4DC', display: 'block' }}>
                  {stageCount(stage.key)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stage.label}
                </span>
              </div>
            ))}
            <div style={{ ...cardStyle, padding: '0.85rem 1rem', borderTop: '3px solid #E87A2E', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: '#E87A2E', display: 'block' }}>
                €{totalPipelineValue.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Pipeline Waarde
              </span>
            </div>
          </div>

          {/* Prospect list with Kanban-style visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 90px 100px 110px', gap: '1rem', padding: '0 1.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prospect</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Score</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Email #</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Fase</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Follow-up</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Actie</span>
            </div>

            {prospects
              .sort((a, b) => b.score - a.score)
              .map(p => {
                const stage = PIPELINE_STAGES.find(s => s.key === p.stage)!;
                const isOverdue = p.nextFollowUp && new Date(p.nextFollowUp) <= new Date();
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProspect(selectedProspect?.id === p.id ? null : p)}
                    style={{
                      ...cardStyle, padding: '0.85rem 1.25rem', cursor: 'pointer',
                      display: 'grid', gridTemplateColumns: '1fr 100px 80px 90px 100px 110px',
                      gap: '1rem', alignItems: 'center',
                      borderLeft: `3px solid ${stage.color}`,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = stage.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(232,228,220,0.06)'}
                  >
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8E4DC' }}>{p.company}</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.1rem' }}>
                        {p.contact} · {p.city} · {p.storeType}
                      </p>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 38, height: 38, borderRadius: '50%',
                        background: `conic-gradient(${p.score >= 80 ? '#34A853' : p.score >= 60 ? '#F5A623' : '#E53E3E'} ${p.score * 3.6}deg, rgba(232,228,220,0.06) 0deg)`,
                      }}>
                        <span style={{
                          width: 30, height: 30, borderRadius: '50%', background: '#1A1917',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, color: '#E8E4DC',
                        }}>{p.score}</span>
                      </div>
                    </div>

                    {/* Sequence */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: p.sequence > 0 ? '#E8E4DC' : 'rgba(232,228,220,0.3)' }}>
                        {p.sequence > 0 ? `${p.sequence}/4` : '—'}
                      </span>
                    </div>

                    {/* Stage */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                        borderRadius: '5px', background: `${stage.color}20`, color: stage.color,
                      }}>{stage.label}</span>
                    </div>

                    {/* Follow up */}
                    <div style={{ textAlign: 'center' }}>
                      {p.nextFollowUp ? (
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: isOverdue ? '#E53E3E' : 'rgba(232,228,220,0.5)',
                        }}>
                          {isOverdue ? 'OVERDUE' : new Date(p.nextFollowUp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.2)' }}>—</span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                      {p.stage === 'new' && (
                        <button onClick={() => { moveProspect(p.id, 'contacted'); sendMessage(`Schrijf de eerste cold email voor ${p.company} (${p.storeType} in ${p.city}). Contact: ${p.contact}. Context: ${p.notes}`); setTab('agent'); }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#E87A2E', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
                          Benader
                        </button>
                      )}
                      {['contacted', 'opened'].includes(p.stage) && (
                        <button onClick={() => { sendMessage(`Schrijf een follow-up email #${p.sequence + 1} voor ${p.company}. Vorige status: ${stage.label}. Context: ${p.notes}`); setTab('agent'); }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(232,228,220,0.08)', color: 'rgba(232,228,220,0.6)', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
                          Follow-up
                        </button>
                      )}
                      {p.stage === 'replied' && (
                        <button onClick={() => moveProspect(p.id, 'meeting')}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(52,211,153,0.15)', color: '#34D399', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
                          Demo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Expanded prospect detail */}
          {selectedProspect && (
            <div style={{ ...cardStyle, marginTop: '1rem', borderLeft: `3px solid ${PIPELINE_STAGES.find(s => s.key === selectedProspect.stage)?.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC' }}>{selectedProspect.company}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.5)', marginTop: '0.2rem' }}>
                    {selectedProspect.contact} · {selectedProspect.email}
                  </p>
                </div>
                <button onClick={() => setSelectedProspect(null)} style={{ background: 'none', border: 'none', color: 'rgba(232,228,220,0.3)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div><span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase' }}>Stad</span><p style={{ color: '#E8E4DC', fontSize: '0.9rem' }}>{selectedProspect.city}</p></div>
                <div><span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase' }}>Type</span><p style={{ color: '#E8E4DC', fontSize: '0.9rem' }}>{selectedProspect.storeType}</p></div>
                <div><span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase' }}>Laatste Actie</span><p style={{ color: '#E8E4DC', fontSize: '0.9rem' }}>{selectedProspect.lastAction}</p></div>
                <div><span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase' }}>Notities</span><p style={{ color: '#E8E4DC', fontSize: '0.9rem' }}>{selectedProspect.notes}</p></div>
              </div>
              <button onClick={() => { sendMessage(`Analyseer prospect ${selectedProspect.company} (${selectedProspect.storeType}, ${selectedProspect.city}). Score: ${selectedProspect.score}. Status: ${selectedProspect.stage}. Notes: ${selectedProspect.notes}. Geef strategie advies: wat is de beste volgende stap en schrijf de perfecte email.`); setTab('agent'); }}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#E87A2E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                AI Strategie voor dit prospect →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ CAMPAIGNS TAB ═══════════════ */}
      {tab === 'campaigns' && (
        <div>
          {/* Outreach performance chart */}
          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>
              Outreach Performance (Wekelijks)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyOutreach}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.06)" />
                <XAxis dataKey="week" stroke="rgba(232,228,220,0.3)" fontSize={12} />
                <YAxis stroke="rgba(232,228,220,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1A1917', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="sent" fill="#4A9EE5" radius={[4, 4, 0, 0]} name="Verzonden" />
                <Bar dataKey="opened" fill="#F5A623" radius={[4, 4, 0, 0]} name="Geopend" />
                <Bar dataKey="replied" fill="#34A853" radius={[4, 4, 0, 0]} name="Beantwoord" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Active sequences */}
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
            Email Sequenties
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {outreachSequences.map((seq, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: seq.active ? '#34A853' : 'rgba(232,228,220,0.2)',
                    }} />
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E8E4DC' }}>{seq.name}</p>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)' }}>
                    {seq.emails} emails in reeks · {seq.prospects} prospects
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#F5A623' }}>{seq.avgOpen}%</p>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase' }}>Open Rate</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#34A853' }}>{seq.avgReply}%</p>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase' }}>Reply Rate</p>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '6px',
                    background: seq.active ? 'rgba(52,168,83,0.12)' : 'rgba(232,228,220,0.06)',
                    color: seq.active ? '#34A853' : 'rgba(232,228,220,0.4)',
                  }}>
                    {seq.active ? 'Actief' : 'Gepauzeerd'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming follow-ups */}
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginTop: '2rem', marginBottom: '1rem' }}>
            Geplande Follow-ups
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {prospects.filter(p => p.nextFollowUp).sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime()).map(p => {
              const isOverdue = new Date(p.nextFollowUp!) <= new Date();
              return (
                <div key={p.id} style={{ ...cardStyle, padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${isOverdue ? '#E53E3E' : '#F5A623'}` }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8E4DC' }}>{p.company}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)' }}>Email #{p.sequence + 1} · {p.contact}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isOverdue ? '#E53E3E' : '#F5A623' }}>
                      {isOverdue ? 'OVERDUE' : new Date(p.nextFollowUp!).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <button onClick={() => { sendMessage(`Schrijf follow-up email #${p.sequence + 1} voor ${p.company} (${p.storeType}). Contact: ${p.contact}. Vorige status: ${p.stage}. Notes: ${p.notes}`); setTab('agent'); }}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#E87A2E', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                      Genereer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ AI AGENT TAB ═══════════════ */}
      {tab === 'agent' && (
        <div style={{ display: 'grid', gridTemplateColumns: generatedEmail ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 260px)', padding: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,122,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E87A2E" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.5rem' }}>
                    AI Outreach Strategist
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.4)', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
                    Kent uw volledige prospect pipeline en schrijft strategische, gepersonaliseerde outreach.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '440px', margin: '0 auto' }}>
                    {[
                      'Analyseer mijn pipeline en geef prioriteiten voor deze week',
                      'Welke prospects moet ik als eerste benaderen en waarom?',
                      'Maak een complete outreach strategie voor mode winkels',
                      'Genereer een 4-staps email sequence voor high-score prospects',
                      'Schrijf een gepersonaliseerde email voor Bijenkorf Amsterdam',
                      'Hoe kan ik mijn reply rate verhogen? Analyseer mijn campagnes.',
                    ].map((p, i) => (
                      <button key={i} onClick={() => sendMessage(p)} style={{
                        padding: '0.6rem 0.85rem', borderRadius: '8px', textAlign: 'left',
                        background: 'rgba(232,228,220,0.04)', border: '1px solid rgba(232,228,220,0.08)',
                        color: 'rgba(232,228,220,0.55)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.3)'; e.currentTarget.style.color = '#E8E4DC'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.08)'; e.currentTarget.style.color = 'rgba(232,228,220,0.55)'; }}
                      >{p}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%', padding: '0.75rem 1rem',
                        borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        background: msg.role === 'user' ? '#E87A2E' : 'rgba(232,228,220,0.06)',
                        color: msg.role === 'user' ? '#fff' : 'rgba(232,228,220,0.8)',
                        fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      }}>{msg.content}</div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: 'flex', gap: '0.35rem', padding: '0.5rem' }}>
                      {[0, 1, 2].map(i => (<div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#E87A2E', animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(232,228,220,0.06)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Vraag om strategie, email generatie, of pipeline analyse..."
                rows={1} style={{ flex: 1, padding: '0.65rem 0.85rem', background: 'rgba(26,25,23,0.7)', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', color: '#E8E4DC', fontSize: '0.85rem', outline: 'none', resize: 'none', minHeight: '40px', fontFamily: 'inherit' }} />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
                padding: '0.65rem 1rem', borderRadius: '8px', background: input.trim() && !loading ? '#E87A2E' : 'rgba(232,228,220,0.06)',
                color: input.trim() && !loading ? '#fff' : 'rgba(232,228,220,0.3)', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.8rem',
              }}>Verstuur</button>
            </div>
          </div>

          {generatedEmail && (
            <div style={{ ...cardStyle, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC' }}>Gegenereerde Email</h3>
                <button onClick={() => navigator.clipboard.writeText(`Onderwerp: ${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(232,228,220,0.06)', border: 'none', color: 'rgba(232,228,220,0.5)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Kopieer</button>
              </div>
              {generatedEmail.targetCompany && (
                <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.4)', marginBottom: '0.5rem' }}>Aan: {generatedEmail.targetName} ({generatedEmail.targetCompany})</p>
              )}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Onderwerp</span>
                <p style={{ fontSize: '0.9rem', color: '#E87A2E', fontWeight: 600, marginTop: '0.2rem' }}>{generatedEmail.subject}</p>
              </div>
              <div style={{ background: 'rgba(26,25,23,0.7)', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(232,228,220,0.06)' }}>
                <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.75)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{generatedEmail.body}</p>
              </div>
              <button style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#E87A2E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                Verstuur Email →
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
