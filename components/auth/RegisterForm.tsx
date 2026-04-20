'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function RegisterForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [winkelnaam, setWinkelnaam] = useState('');
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
    if (!naam || !email || !wachtwoord || !winkelnaam) return;
    if (wachtwoord.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten.');
      return;
    }
    setError('');
    setLoading(true);

    const supabase = getSupabaseBrowser();

    // 1. Create the auth account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: wachtwoord,
      options: {
        data: {
          naam,
          winkelnaam,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Dit e-mailadres is al in gebruik. Probeer in te loggen.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    // 2. Save extra profile data to user_profiles table
    if (data.user) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        naam,
        winkelnaam,
        email,
      });
    }

    // 3. If email confirmation is enabled, show a message; otherwise go to dashboard
    if (data.session) {
      router.push('/dashboard');
      router.refresh();
    } else {
      // Email confirmation required — redirect to a confirmation page
      router.push('/login?registered=1');
    }
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    color: 'rgba(232, 228, 220, 0.5)',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E87A2E';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(232, 228, 220, 0.1)';
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
        Maak uw account aan
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Error message */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '8px', color: '#E53E3E', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Naam */}
        <div>
          <label htmlFor="reg-naam" style={labelStyle}>Naam</label>
          <input id="reg-naam" type="text" required value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Uw volledige naam" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" style={labelStyle}>E-mailadres</label>
          <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@voorbeeld.nl" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        {/* Wachtwoord */}
        <div>
          <label htmlFor="reg-password" style={labelStyle}>Wachtwoord</label>
          <input id="reg-password" type="password" required minLength={8} value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} placeholder="Minimaal 8 tekens" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        {/* Winkelnaam */}
        <div>
          <label htmlFor="reg-winkel" style={labelStyle}>Winkelnaam</label>
          <input id="reg-winkel" type="text" required value={winkelnaam} onChange={(e) => setWinkelnaam(e.target.value)} placeholder="Naam van uw winkel" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
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
          {loading ? 'Account aanmaken...' : 'Account aanmaken'}
        </button>
      </form>

      {/* Login link */}
      <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'rgba(232, 228, 220, 0.45)', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        Al een account?{' '}
        <a href="/login" style={{ color: '#E87A2E', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E87A2E'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}>
          Log in
        </a>
      </p>
    </div>
  );
}
