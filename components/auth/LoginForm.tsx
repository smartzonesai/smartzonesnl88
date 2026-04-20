'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    if (!email || !password) return;
    setError('');
    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Ongeldig e-mailadres of wachtwoord.');
      setLoading(false);
      return;
    }

    const redirect = searchParams.get('redirect') || '/dashboard';
    router.push(redirect);
    router.refresh();
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
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        opacity: 0,
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E8E4DC' }}>
          Smart Zones<span style={{ color: '#E87A2E' }}>.</span>
        </span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: '#E8E4DC', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.2 }}>
        Log in op uw dashboard
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Error message */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '8px', color: '#E53E3E', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(232, 228, 220, 0.5)', marginBottom: '0.5rem', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
            E-mailadres
          </label>
          <input
            id="login-email"
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

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label htmlFor="login-password" style={{ fontSize: '0.8rem', color: 'rgba(232, 228, 220, 0.5)', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
              Wachtwoord
            </label>
            <a href="/forgot-password" style={{ fontSize: '0.75rem', color: '#E87A2E', textDecoration: 'none', opacity: 0.8 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}>
              Vergeten?
            </a>
          </div>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#E87A2E'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 228, 220, 0.1)'; }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            padding: '1rem',
            background: loading ? 'rgba(232,122,46,0.6)' : '#E87A2E',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontFamily: 'var(--font-syne), system-ui, sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 4px 14px rgba(232, 122, 46, 0.3)',
            marginTop: '0.5rem',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Inloggen...' : 'Inloggen'}
        </button>
      </form>

      {/* Register link */}
      <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'rgba(232, 228, 220, 0.45)', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        Nog geen account?{' '}
        <a href="/register" style={{ color: '#E87A2E', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E87A2E'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}>
          Registreer
        </a>
      </p>
    </div>
  );
}
