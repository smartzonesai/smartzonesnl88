'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import Link from 'next/link';

interface AnalysisSummary {
  id: string;
  store_name: string;
  store_type: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  created_at: string;
  zones_count: number;
  growth_potential: string;
}

const statusLabels: Record<string, { label: string; bg: string; color: string }> = {
  complete: { label: 'Voltooid', bg: 'rgba(52,168,83,0.15)', color: '#34A853' },
  processing: { label: 'In verwerking', bg: 'rgba(232,122,46,0.15)', color: '#E87A2E' },
  pending: { label: 'Wachtrij', bg: 'rgba(232,228,220,0.08)', color: 'rgba(232,228,220,0.5)' },
  failed: { label: 'Mislukt', bg: 'rgba(229,62,62,0.15)', color: '#E53E3E' },
};

export default function AnalysesList() {
  const listRef = useRef<HTMLDivElement>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const { getSupabaseBrowser } = await import('@/lib/supabase-browser');
        const supabase = getSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) { setLoading(false); return; }

        const res = await fetch('/api/analyses');
        if (res.ok) {
          const data = await res.json();
          setAnalyses(data);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchAnalyses();
  }, []);

  useEffect(() => {
    if (!listRef.current || loading) return;
    const cards = listRef.current.querySelectorAll('.analysis-row');
    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 20 });
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 });
    });
    return () => ctx.revert();
  }, [loading, analyses]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem' }}>Laden...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne), system-ui', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>
            Mijn analyses
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.45)', marginTop: '0.25rem' }}>
            {analyses.length} analyse{analyses.length !== 1 ? 's' : ''} totaal
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          style={{
            padding: '0.7rem 1.5rem',
            backgroundColor: '#E87A2E',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Nieuwe analyse →
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div style={{
          background: 'rgba(26, 25, 23, 0.5)',
          border: '1px solid rgba(232, 228, 220, 0.06)',
          borderRadius: '14px',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '1rem', color: 'rgba(232,228,220,0.5)', marginBottom: '1rem' }}>
            U heeft nog geen analyses
          </p>
          <Link href="/dashboard/upload" style={{ color: '#E87A2E', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
            Start uw eerste analyse →
          </Link>
        </div>
      ) : (
        <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {analyses.map((a) => {
            const st = statusLabels[a.status] || statusLabels.pending;
            const dateStr = new Date(a.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
            const isActive = a.status === 'processing' || a.status === 'pending';

            return (
              <div
                key={a.id}
                className="analysis-row"
                style={{
                  background: 'rgba(26, 25, 23, 0.5)',
                  border: '1px solid rgba(232, 228, 220, 0.06)',
                  borderRadius: '14px',
                  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto auto',
                  alignItems: 'center',
                  gap: '1.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(232,228,220,0.12)';
                  e.currentTarget.style.background = 'rgba(26,25,23,0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(232,228,220,0.06)';
                  e.currentTarget.style.background = 'rgba(26,25,23,0.5)';
                }}
              >
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#E8E4DC' }}>{a.store_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.2rem' }}>{dateStr} · {a.store_type}</p>
                </div>

                <div className="hidden md:block" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#E8E4DC' }}>{a.zones_count || '—'}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zones</p>
                </div>

                <div className="hidden md:block" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: a.growth_potential.startsWith('+') ? '#34A853' : 'rgba(232,228,220,0.4)' }}>{a.growth_potential}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Groei</p>
                </div>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.75rem',
                  borderRadius: '6px', letterSpacing: '0.03em', whiteSpace: 'nowrap',
                  background: st.bg, color: st.color,
                }}>
                  {isActive && (
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: st.color, marginRight: '0.4rem', animation: 'trafficPulse 1.5s ease-in-out infinite' }} />
                  )}
                  {st.label}
                </span>

                {a.status === 'complete' ? (
                  <Link href={`/dashboard/analysis/${a.id}`} style={{ fontSize: '0.8rem', color: '#E87A2E', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Bekijk →
                  </Link>
                ) : a.status === 'failed' ? (
                  <Link href="/dashboard/upload" style={{ fontSize: '0.8rem', color: '#E53E3E', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Opnieuw
                  </Link>
                ) : (
                  <Link href={`/dashboard/analysis/${a.id}`} style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.3)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Bekijk status...
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
