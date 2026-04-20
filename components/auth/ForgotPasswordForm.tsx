'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function ForgotPasswordForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/settings`,
    });

    if (error) {
      setMessage({ type: 'err', text: 'Er ging iets mis. Controleer het e-mailadres en probeer opnieuw.' });
    } else {
      setMessage({ type: 'ok', text: 'Als dit e-mailadres bekend is, ontvangt u een resetlink. Controleer ook uw spam.' });
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    background: 'rgba(17, 17, 16, 0.8)',
    border: '1px solid rgba(232, 228, 220, 0.1)',
    borderRadius: '10px',
    color: '#E8E4DC',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  };

  return (
    <div
      ref={cardRef}
      style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(26, 25, 23, 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(232, 228, 220, 0.08)',
        borderRadius: '20px',
        padding: 'clamp(2rem, 4vw, 3rem)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.4)',
        opacity: 0,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E8E4DC' }}>
          Smart Zones<span style={{ color: '#E87A2E' }}>.</span>
        </span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: '#E8E4DC', textAlign: 'center', marginBottom: '0.75rem' }}>
        Wachtwoord vergeten?
      </h1>
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(232,228,220,0.45)', marginBottom: '2rem' }}>
        Vul uw e-mailadres in en u ontvangt een resetlink.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {message && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', background: message.type === 'ok' ? 'rgba(52,211,153,0.1)' : 'rgba(229,62,62,0.1)', border: `1px solid ${message.type === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(229,62,62,0.3)'}`, color: message.type === 'ok' ? '#34D399' : '#E53E3E' }}>
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="forgot-email" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)', marginBottom: '0.5rem', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
            E-mailadres
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@voorbeeld.nl"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#E87A2E'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 228, 220, 0.1)'; }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '1rem', background: loading ? 'rgba(232,122,46,0.6)' : '#E87A2E', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s' }}
        >
          {loading ? 'Versturen...' : 'Resetlink versturen'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'rgba(232,228,220,0.45)', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        <a href="/login" style={{ color: '#E87A2E', textDecoration: 'none' }}>← Terug naar inloggen</a>
      </p>
    </div>
  );
}
