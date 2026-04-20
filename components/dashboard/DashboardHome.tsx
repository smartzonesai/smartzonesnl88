'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';

interface AnalysisSummary {
  id: string;
  store_name: string;
  status: string;
  created_at: string;
  zones_count: number;
  growth_potential: string;
}

export default function DashboardHome() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('Gebruiker');
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { getSupabaseBrowser } = await import('@/lib/supabase-browser');
        const supabase = getSupabaseBrowser();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Get display name: check user_profiles first, then metadata, then email prefix
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('naam')
          .eq('id', user.id)
          .single();

        const displayName =
          profile?.naam ||
          user.user_metadata?.naam ||
          (user.email ? user.email.split('@')[0] : 'Gebruiker');
        setUserName(displayName);

        const res = await fetch('/api/analyses');
        if (res.ok) {
          const data = await res.json();
          setAnalyses(data);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!containerRef.current || loading) return;
    const cards = containerRef.current.querySelectorAll('.dash-card');
    gsap.set(cards, { opacity: 0, y: 30 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.15,
    });
  }, [loading]);

  const activeCount = analyses.filter(a => a.status === 'processing' || a.status === 'pending').length;
  const completedCount = analyses.filter(a => a.status === 'complete').length;

  const statusLabel = (status: string) => {
    if (status === 'complete') return { text: 'Voltooid', bg: 'rgba(52,211,153,0.12)', color: '#34D399' };
    if (status === 'failed') return { text: 'Mislukt', bg: 'rgba(229,62,62,0.12)', color: '#E53E3E' };
    return { text: 'In verwerking', bg: 'rgba(232,122,46,0.12)', color: '#E87A2E' };
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        background: '#111110',
        color: '#E8E4DC',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Greeting */}
        <div className="dash-card" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.25rem' }}>
            Welkom terug, {userName}
          </h1>
          <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '1rem' }}>
            Uw winkelanalyses op één plek
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {[
            { value: String(analyses.length), label: 'Totaal analyses', borderColor: '#E87A2E' },
            { value: String(activeCount || completedCount), label: activeCount ? 'Actieve analyses' : 'Voltooide analyses', borderColor: '#F5A623' },
            { value: '< 1 uur', label: 'Levertijd', borderColor: '#3B82F6' },
          ].map((stat, i) => (
            <div
              key={i}
              className="dash-card"
              style={{
                background: 'rgba(26,25,23,0.5)',
                border: '1px solid rgba(232,228,220,0.08)',
                borderTop: `3px solid ${stat.borderColor}`,
                borderRadius: '14px',
                padding: '1.5rem',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: '#E8E4DC', display: 'block', lineHeight: 1.1 }}>
                {stat.value}
              </span>
              <span style={{ color: 'rgba(232,228,220,0.45)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Analyses section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="dash-card" style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: '1.25rem', fontWeight: 600, color: '#E8E4DC', marginBottom: '1.25rem' }}>
            Uw analyses
          </h2>

          {loading ? (
            <p style={{ color: 'rgba(232,228,220,0.4)', fontSize: '0.9rem' }}>Laden...</p>
          ) : analyses.length === 0 ? (
            <div
              className="dash-card"
              style={{
                background: 'rgba(26,25,23,0.5)',
                border: '1px solid rgba(232,228,220,0.08)',
                borderRadius: '14px',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,220,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.25rem' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: '1.25rem', fontWeight: 600, color: '#E8E4DC', marginBottom: '0.5rem' }}>
                Nog geen analyses
              </h3>
              <p style={{ color: 'rgba(232,228,220,0.45)', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
                Upload uw eerste video om te beginnen
              </p>
              <Link
                href="/dashboard/upload"
                style={{ display: 'inline-block', background: '#E87A2E', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.3s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#D06820'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#E87A2E'; }}
              >
                Start analyse &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyses.slice(0, 5).map((a) => {
                const st = statusLabel(a.status);
                const dateStr = new Date(a.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
                const isClickable = a.status === 'complete' || a.status === 'processing' || a.status === 'pending';

                return (
                  <div
                    key={a.id}
                    className="dash-card"
                    style={{
                      background: 'rgba(26,25,23,0.5)',
                      border: '1px solid rgba(232,228,220,0.08)',
                      borderRadius: '14px',
                      padding: '1.25rem 1.5rem',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      transition: 'border-color 0.3s ease',
                      cursor: isClickable ? 'pointer' : 'default',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.18)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.08)'; }}
                  >
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#E8E4DC', display: 'block' }}>
                        {a.store_name}
                      </span>
                      <span style={{ color: 'rgba(232,228,220,0.4)', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'block' }}>
                        {dateStr}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        background: st.bg, color: st.color,
                        fontSize: '0.75rem', fontWeight: 600,
                        padding: '0.3rem 0.75rem', borderRadius: '999px',
                        letterSpacing: '0.02em',
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      }}>
                        {(a.status === 'processing' || a.status === 'pending') && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                        )}
                        {st.text}
                      </span>

                      <Link
                        href={`/dashboard/analysis/${a.id}`}
                        style={{
                          color: a.status === 'complete' ? '#E87A2E' : 'rgba(232,228,220,0.35)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.2s',
                        }}
                      >
                        {a.status === 'complete' ? 'Bekijk resultaten →' : 'Bekijk status...'}
                      </Link>
                    </div>
                  </div>
                );
              })}

              {analyses.length > 5 && (
                <Link
                  href="/dashboard/analyses"
                  className="dash-card"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '0.85rem',
                    color: '#E87A2E',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    border: '1px solid rgba(232,122,46,0.2)',
                    borderRadius: '10px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,122,46,0.06)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  Bekijk alle {analyses.length} analyses →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick action */}
        <div className="dash-card">
          <Link
            href="/dashboard/upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#E87A2E',
              color: '#fff',
              padding: '1rem 2.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(232,122,46,0.3)',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#D06820';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#E87A2E';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Nieuwe analyse starten <span>&rarr;</span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
