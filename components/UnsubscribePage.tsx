'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#111110',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: '480px',
    width: '100%',
    background: 'rgba(26,25,23,0.7)',
    border: '1px solid rgba(232,228,220,0.08)',
    borderRadius: '20px',
    padding: 'clamp(2rem, 5vw, 3rem)',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 700, fontSize: '1.35rem', color: '#E8E4DC' }}>
            Smart Zones<span style={{ color: '#E87A2E' }}>.</span>
          </span>
        </div>

        {status === 'done' ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.75rem' }}>
              Afgemeld
            </h1>
            <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {email && <strong style={{ color: '#E8E4DC' }}>{email}</strong>} is verwijderd van onze lijst.
              U ontvangt geen e-mails meer van Smart Zones.
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.75rem' }}>
              Er ging iets mis
            </h1>
            <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Stuur een e-mail naar <a href="mailto:info@smartzones.nl" style={{ color: '#E87A2E' }}>info@smartzones.nl</a> en wij verwijderen u direct.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.75rem' }}>
              Afmelden voor e-mails
            </h1>
            <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {email
                ? <>Weet u zeker dat u <strong style={{ color: '#E8E4DC' }}>{email}</strong> wilt afmelden van alle Smart Zones e-mails?</>
                : 'U staat op het punt u af te melden van Smart Zones e-mails.'}
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={status === 'loading'}
              style={{
                padding: '0.85rem 2rem',
                background: status === 'loading' ? 'rgba(229,62,62,0.4)' : 'rgba(229,62,62,0.15)',
                border: '1px solid rgba(229,62,62,0.3)',
                borderRadius: '10px',
                color: '#E53E3E',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: status === 'loading' ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              {status === 'loading' ? 'Verwerken...' : 'Ja, meld mij af'}
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(232,228,220,0.25)' }}>
              Vergissing? <a href="/" style={{ color: 'rgba(232,228,220,0.4)', textDecoration: 'none' }}>Ga terug naar de website</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
