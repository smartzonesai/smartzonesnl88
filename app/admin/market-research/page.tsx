'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_TOPICS = [
  'Wat zijn de laatste trends in retail winkelindeling voor 2026?',
  'Analyseer de markt voor AI-gestuurde retail optimalisatie in Nederland',
  'Wat doen concurrenten in de retail analytics ruimte?',
  'Hoe groot is de markt voor winkeloptimalisatie in de Benelux?',
  'Wat zijn de meest winstgevende niches in retail consulting?',
  'Welke pricing strategie werkt het best voor SaaS in retail?',
];

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

export default function MarketResearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/market-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response || 'Er ging iets mis. Probeer het opnieuw.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Verbindingsfout. Probeer het opnieuw.', timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>
          Marktonderzoek AI
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
          AI-agent voor marktanalyse, concurrentieonderzoek en trendrapportages
        </p>
      </div>

      {/* Chat area */}
      <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(232,122,46,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E87A2E" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.5rem' }}>
                Stel een vraag over de markt
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                Deze AI-agent doet marktonderzoek, analyseert trends, en geeft strategisch advies voor SmartZones.
              </p>

              {/* Suggested topics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
                {SUGGESTED_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(topic)}
                    style={{
                      padding: '0.75rem 1rem', borderRadius: '10px', textAlign: 'left',
                      background: 'rgba(232,228,220,0.04)', border: '1px solid rgba(232,228,220,0.08)',
                      color: 'rgba(232,228,220,0.6)', fontSize: '0.85rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.3)'; e.currentTarget.style.color = '#E8E4DC'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.08)'; e.currentTarget.style.color = 'rgba(232,228,220,0.6)'; }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? '#E87A2E' : 'rgba(232,228,220,0.06)',
                    color: msg.role === 'user' ? '#fff' : 'rgba(232,228,220,0.8)',
                    fontSize: '0.875rem',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.35rem', padding: '0.5rem' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#E87A2E',
                      animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(232,228,220,0.06)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stel een vraag over de markt..."
            rows={1}
            style={{
              flex: 1, padding: '0.75rem 1rem', background: 'rgba(26,25,23,0.7)',
              border: '1px solid rgba(232,228,220,0.1)', borderRadius: '10px',
              color: '#E8E4DC', fontSize: '0.875rem', outline: 'none', resize: 'none',
              minHeight: '44px', maxHeight: '120px', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1.25rem', borderRadius: '10px',
              background: input.trim() && !loading ? '#E87A2E' : 'rgba(232,228,220,0.06)',
              color: input.trim() && !loading ? '#fff' : 'rgba(232,228,220,0.3)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
            }}
          >
            Verstuur
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
