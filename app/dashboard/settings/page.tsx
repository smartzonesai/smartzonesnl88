'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function SettingsPage() {
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [winkelnaam, setWinkelnaam] = useState('');
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('');
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('');
  const [bevestigWachtwoord, setBevestigWachtwoord] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || '');

      // Load profile from user_profiles table
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('naam, winkelnaam')
        .eq('id', user.id)
        .single();

      if (profile) {
        setNaam(profile.naam || '');
        setWinkelnaam(profile.winkelnaam || '');
      } else {
        // Fallback to user_metadata if no profile row yet
        setNaam(user.user_metadata?.naam || '');
        setWinkelnaam(user.user_metadata?.winkelnaam || '');
      }
    });
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    setProfileMsg(null);
    const supabase = getSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      naam,
      winkelnaam,
      email,
    });

    if (error) {
      setProfileMsg({ type: 'err', text: 'Opslaan mislukt: ' + error.message });
    } else {
      setProfileMsg({ type: 'ok', text: 'Profiel opgeslagen.' });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (nieuwWachtwoord !== bevestigWachtwoord) {
      setPasswordMsg({ type: 'err', text: 'Wachtwoorden komen niet overeen.' });
      return;
    }
    if (nieuwWachtwoord.length < 8) {
      setPasswordMsg({ type: 'err', text: 'Wachtwoord moet minimaal 8 tekens bevatten.' });
      return;
    }
    setPwLoading(true);
    setPasswordMsg(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: nieuwWachtwoord });

    if (error) {
      setPasswordMsg({ type: 'err', text: 'Wijzigen mislukt: ' + error.message });
    } else {
      setPasswordMsg({ type: 'ok', text: 'Wachtwoord gewijzigd.' });
      setHuidigWachtwoord('');
      setNieuwWachtwoord('');
      setBevestigWachtwoord('');
    }
    setPwLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(232,228,220,0.05)',
    border: '1px solid rgba(232,228,220,0.1)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#E8E4DC',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(232,228,220,0.4)',
    display: 'block',
    marginBottom: '0.4rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(26,25,23,0.5)',
    border: '1px solid rgba(232,228,220,0.06)',
    borderRadius: '14px',
    padding: 'clamp(1.5rem, 3vw, 2rem)',
  };

  const saveBtnStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    padding: '0.7rem 1.5rem',
    backgroundColor: '#E87A2E',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-syne), system-ui', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.5rem' }}>
        Instellingen
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.45)', marginBottom: '2rem' }}>
        Beheer uw account en voorkeuren
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>

        {/* Profiel */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#E8E4DC', marginBottom: '1.25rem' }}>Profiel</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Naam</label>
              <input value={naam} onChange={(e) => setNaam(e.target.value)} style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Winkelnaam</label>
              <input value={winkelnaam} onChange={(e) => setWinkelnaam(e.target.value)} style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }} />
            </div>
            <div>
              <label style={labelStyle}>E-mailadres</label>
              <input value={email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.3)', marginTop: '0.3rem' }}>E-mailadres kan niet worden gewijzigd.</p>
            </div>

            {profileMsg && (
              <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', background: profileMsg.type === 'ok' ? 'rgba(52,211,153,0.1)' : 'rgba(229,62,62,0.1)', border: `1px solid ${profileMsg.type === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(229,62,62,0.3)'}`, color: profileMsg.type === 'ok' ? '#34D399' : '#E53E3E' }}>
                {profileMsg.text}
              </div>
            )}

            <button onClick={handleSaveProfile} disabled={loading} style={{ ...saveBtnStyle, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D06820'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#E87A2E'; }}>
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </div>

        {/* Wachtwoord wijzigen */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#E8E4DC', marginBottom: '1.25rem' }}>Wachtwoord wijzigen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nieuw wachtwoord</label>
              <input type="password" value={nieuwWachtwoord} onChange={(e) => setNieuwWachtwoord(e.target.value)} placeholder="Minimaal 8 tekens" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Bevestig nieuw wachtwoord</label>
              <input type="password" value={bevestigWachtwoord} onChange={(e) => setBevestigWachtwoord(e.target.value)} placeholder="Herhaal wachtwoord" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }} />
            </div>

            {passwordMsg && (
              <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', background: passwordMsg.type === 'ok' ? 'rgba(52,211,153,0.1)' : 'rgba(229,62,62,0.1)', border: `1px solid ${passwordMsg.type === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(229,62,62,0.3)'}`, color: passwordMsg.type === 'ok' ? '#34D399' : '#E53E3E' }}>
                {passwordMsg.text}
              </div>
            )}

            <button onClick={handleChangePassword} disabled={pwLoading} style={{ ...saveBtnStyle, opacity: pwLoading ? 0.6 : 1 }}
              onMouseEnter={(e) => { if (!pwLoading) e.currentTarget.style.background = '#D06820'; }}
              onMouseLeave={(e) => { if (!pwLoading) e.currentTarget.style.background = '#E87A2E'; }}>
              {pwLoading ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
            </button>
          </div>
        </div>

        {/* Gevarenzone */}
        <div style={{ ...cardStyle, border: '1px solid rgba(229,62,62,0.15)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#E53E3E', marginBottom: '0.75rem' }}>Gevarenzone</h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.45)', marginBottom: '1rem' }}>
            Account verwijderen is permanent en kan niet ongedaan worden gemaakt. Al uw analyses worden verwijderd.
          </p>
          <button
            onClick={async () => {
              if (!confirm('Weet u zeker dat u uw account permanent wilt verwijderen? Al uw analyses en gegevens worden onherroepelijk verwijderd (AVG-recht op vergetelheid).')) return;
              const secondConfirm = prompt('Typ "VERWIJDEREN" om te bevestigen:');
              if (secondConfirm !== 'VERWIJDEREN') return;

              try {
                const res = await fetch('/api/account/delete', { method: 'DELETE' });
                if (res.ok) {
                  const supabase = getSupabaseBrowser();
                  await supabase.auth.signOut();
                  window.location.href = '/?account=verwijderd';
                } else {
                  const err = await res.json();
                  alert('Verwijderen mislukt: ' + (err.error || 'Onbekende fout'));
                }
              } catch {
                alert('Er is een fout opgetreden. Probeer het later opnieuw.');
              }
            }}
            style={{ padding: '0.6rem 1.25rem', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', color: '#E53E3E', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.1)'; }}>
            Account en alle gegevens verwijderen (AVG)
          </button>
        </div>

      </div>
    </div>
  );
}
