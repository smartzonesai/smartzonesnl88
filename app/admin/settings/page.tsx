'use client';

import { useEffect, useState } from 'react';

interface ToneConfig {
  id: string;
  name: string;
  description: string | null;
  system_prompt_prefix: string;
  is_default: boolean;
  created_at: string;
}

interface ApiKeyConfig {
  id: string;
  provider: string;
  masked_key: string | null;
  is_active: boolean;
  verification_status: 'unverified' | 'valid' | 'invalid';
  last_verified_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [tones, setTones] = useState<ToneConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // API Key state
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // New tone form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchTones = async () => {
    try {
      const res = await fetch('/api/admin/tone');
      const data = await res.json();
      if (data.tones) setTones(data.tones);
    } catch {
      setError('Kon tooninstellingen niet laden');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeyConfig = async () => {
    try {
      const res = await fetch('/api/admin/api-keys');
      const data = await res.json();
      setApiKeyConfig(data.config || null);
    } catch {
      // silently fail — env var fallback still works
    }
  };

  const saveApiKey = async () => {
    if (!newApiKey.trim()) {
      setError('Voer een API-sleutel in');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newApiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setApiKeyConfig(data.config);
      setNewApiKey('');
      setShowKey(false);

      if (data.verification?.valid) {
        setSuccess('API-sleutel opgeslagen en geverifieerd ✓');
      } else {
        setError(`API-sleutel ongeldig: ${data.verification?.error || 'Verificatie mislukt'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan');
    } finally {
      setVerifying(false);
    }
  };

  const deleteApiKey = async () => {
    if (!apiKeyConfig) return;
    if (!confirm('Weet u zeker dat u de API-sleutel wilt verwijderen? Het systeem valt terug op de serveromgeving.')) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/api-keys?id=${apiKeyConfig.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setApiKeyConfig(null);
      setSuccess('API-sleutel verwijderd');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchTones();
    fetchApiKeyConfig();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const setDefault = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_default: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess('Standaard tone bijgewerkt');
      await fetchTones();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij bijwerken');
    } finally {
      setSaving(false);
    }
  };

  const createTone = async () => {
    if (!newName.trim() || !newPrompt.trim()) {
      setError('Naam en systeemprompt zijn verplicht');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
          system_prompt_prefix: newPrompt.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess('Nieuwe tone aangemaakt');
      setNewName('');
      setNewDescription('');
      setNewPrompt('');
      setShowForm(false);
      await fetchTones();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij aanmaken');
    } finally {
      setSaving(false);
    }
  };

  const deleteTone = async (id: string, name: string) => {
    if (!confirm(`Weet u zeker dat u "${name}" wilt verwijderen?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tone?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess(`"${name}" verwijderd`);
      await fetchTones();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(26,25,23,0.7)',
    border: '1px solid rgba(232,228,220,0.1)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    color: '#E8E4DC',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(232,228,220,0.6)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
    letterSpacing: '0.02em',
  };

  if (loading) {
    return (
      <div style={{ color: 'rgba(232,228,220,0.5)', padding: '2rem', textAlign: 'center' }}>
        Laden...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-syne), system-ui, sans-serif',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700,
          color: '#E8E4DC',
          marginBottom: '0.5rem',
        }}>
          Instellingen
        </h1>
        <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem' }}>
          Configureer de AI communicatiestijl voor analyses en outreach.
        </p>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: '10px',
          color: '#34D399',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(229,62,62,0.1)',
          border: '1px solid rgba(229,62,62,0.3)',
          borderRadius: '10px',
          color: '#E53E3E',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* API Key Configuration */}
      <div style={{
        background: 'rgba(26,25,23,0.5)',
        border: '1px solid rgba(232,228,220,0.08)',
        borderRadius: '16px',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-syne), system-ui, sans-serif',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#E8E4DC',
            marginBottom: '0.25rem',
          }}>
            API Configuratie
          </h2>
          <p style={{ color: 'rgba(232,228,220,0.4)', fontSize: '0.8125rem' }}>
            Configureer uw Anthropic API-sleutel voor AI-analyses en outreach.
          </p>
        </div>

        {/* Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.25rem',
          padding: '0.75rem 1rem',
          background: 'rgba(14,13,11,0.4)',
          borderRadius: '10px',
          border: `1px solid ${
            apiKeyConfig?.verification_status === 'valid'
              ? 'rgba(52,211,153,0.2)'
              : apiKeyConfig?.verification_status === 'invalid'
                ? 'rgba(229,62,62,0.2)'
                : 'rgba(232,228,220,0.06)'
          }`,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: apiKeyConfig?.verification_status === 'valid'
              ? '#34D399'
              : apiKeyConfig?.verification_status === 'invalid'
                ? '#E53E3E'
                : 'rgba(232,228,220,0.3)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <span style={{
              color: apiKeyConfig?.verification_status === 'valid'
                ? '#34D399'
                : apiKeyConfig?.verification_status === 'invalid'
                  ? '#E53E3E'
                  : 'rgba(232,228,220,0.5)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}>
              {apiKeyConfig?.verification_status === 'valid'
                ? 'Actief en geverifieerd'
                : apiKeyConfig?.verification_status === 'invalid'
                  ? 'Ongeldige sleutel'
                  : 'Geen API-sleutel geconfigureerd'}
            </span>
            {apiKeyConfig?.masked_key && (
              <span style={{
                color: 'rgba(232,228,220,0.3)',
                fontSize: '0.8rem',
                marginLeft: '0.75rem',
                fontFamily: 'monospace',
              }}>
                {apiKeyConfig.masked_key}
              </span>
            )}
          </div>
          {apiKeyConfig?.last_verified_at && (
            <span style={{
              color: 'rgba(232,228,220,0.3)',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>
              Geverifieerd: {new Date(apiKeyConfig.last_verified_at).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Key input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Anthropic API-sleutel</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder={apiKeyConfig?.masked_key || 'sk-ant-api03-...'}
              style={{ ...inputStyle, paddingRight: '3rem', fontFamily: 'monospace' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'rgba(232,228,220,0.4)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '0.25rem',
                fontFamily: 'inherit',
              }}
              title={showKey ? 'Verbergen' : 'Tonen'}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={saveApiKey}
            disabled={verifying || !newApiKey.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: verifying || !newApiKey.trim() ? 'rgba(232,122,46,0.4)' : '#E87A2E',
              color: '#fff',
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              border: 'none',
              cursor: verifying || !newApiKey.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (!verifying && newApiKey.trim()) (e.currentTarget as HTMLElement).style.background = '#D06820';
            }}
            onMouseLeave={(e) => {
              if (!verifying && newApiKey.trim()) (e.currentTarget as HTMLElement).style.background = '#E87A2E';
            }}
          >
            {verifying ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Verifiëren...
              </>
            ) : (
              'Opslaan & Verifiëren'
            )}
          </button>

          {apiKeyConfig && (
            <button
              onClick={deleteApiKey}
              disabled={verifying}
              style={{
                background: 'transparent',
                color: 'rgba(229,62,62,0.6)',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: '1px solid rgba(229,62,62,0.15)',
                cursor: verifying ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,62,62,0.4)';
                (e.currentTarget as HTMLElement).style.color = '#E53E3E';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,62,62,0.15)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(229,62,62,0.6)';
              }}
            >
              Verwijderen
            </button>
          )}
        </div>

        {/* Info text */}
        <p style={{
          color: 'rgba(232,228,220,0.3)',
          fontSize: '0.75rem',
          marginTop: '1rem',
          lineHeight: 1.5,
        }}>
          De API-sleutel wordt veilig opgeslagen en gebruikt voor alle AI-analyses.
          Als er geen sleutel is ingesteld, wordt de serveromgeving gebruikt als fallback.
        </p>
      </div>

      {/* Spinner keyframe animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Tone of Voice section */}
      <div style={{
        background: 'rgba(26,25,23,0.5)',
        border: '1px solid rgba(232,228,220,0.08)',
        borderRadius: '16px',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-syne), system-ui, sans-serif',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#E8E4DC',
              marginBottom: '0.25rem',
            }}>
              Tone of Voice
            </h2>
            <p style={{ color: 'rgba(232,228,220,0.4)', fontSize: '0.8125rem' }}>
              De geselecteerde tone wordt gebruikt bij alle AI-analyses en outreach.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#E87A2E',
              color: '#fff',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#D06820'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#E87A2E'; }}
          >
            {showForm ? 'Annuleren' : '+ Nieuwe tone'}
          </button>
        </div>

        {/* New tone form */}
        {showForm && (
          <div style={{
            background: 'rgba(14,13,11,0.6)',
            border: '1px solid rgba(232,122,46,0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{
              color: '#E87A2E',
              fontSize: '0.9375rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              Nieuwe tone aanmaken
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Naam *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Bijv. Enthousiast"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Beschrijving</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Korte beschrijving van deze stijl"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Systeemprompt *</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={4}
                  placeholder="De instructie die aan het begin van elk AI-verzoek wordt toegevoegd..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={createTone}
                  disabled={saving}
                  style={{
                    background: '#E87A2E',
                    color: '#fff',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: saving ? 'wait' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    transition: 'background 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#D06820'; }}
                  onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#E87A2E'; }}
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tone list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tones.map((tone) => (
            <div
              key={tone.id}
              style={{
                background: tone.is_default ? 'rgba(232,122,46,0.06)' : 'rgba(14,13,11,0.4)',
                border: `1px solid ${tone.is_default ? 'rgba(232,122,46,0.25)' : 'rgba(232,228,220,0.06)'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 style={{
                      color: '#E8E4DC',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}>
                      {tone.name}
                    </h3>
                    {tone.is_default && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        background: 'rgba(232,122,46,0.15)',
                        color: '#E87A2E',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>
                        Standaard
                      </span>
                    )}
                  </div>
                  {tone.description && (
                    <p style={{
                      color: 'rgba(232,228,220,0.5)',
                      fontSize: '0.8125rem',
                      marginBottom: '0.75rem',
                    }}>
                      {tone.description}
                    </p>
                  )}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8rem',
                    color: 'rgba(232,228,220,0.4)',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    maxHeight: '80px',
                    overflow: 'hidden',
                  }}>
                    {tone.system_prompt_prefix}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {!tone.is_default && (
                    <>
                      <button
                        onClick={() => setDefault(tone.id)}
                        disabled={saving}
                        style={{
                          background: 'transparent',
                          color: 'rgba(232,228,220,0.6)',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          border: '1px solid rgba(232,228,220,0.12)',
                          cursor: saving ? 'wait' : 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,122,46,0.4)';
                          (e.currentTarget as HTMLElement).style.color = '#E87A2E';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.12)';
                          (e.currentTarget as HTMLElement).style.color = 'rgba(232,228,220,0.6)';
                        }}
                      >
                        Standaard maken
                      </button>
                      <button
                        onClick={() => deleteTone(tone.id, tone.name)}
                        disabled={saving}
                        style={{
                          background: 'transparent',
                          color: 'rgba(229,62,62,0.6)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          border: '1px solid rgba(229,62,62,0.15)',
                          cursor: saving ? 'wait' : 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,62,62,0.4)';
                          (e.currentTarget as HTMLElement).style.color = '#E53E3E';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,62,62,0.15)';
                          (e.currentTarget as HTMLElement).style.color = 'rgba(229,62,62,0.6)';
                        }}
                      >
                        Verwijderen
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tones.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(232,228,220,0.35)',
              fontSize: '0.875rem',
            }}>
              Geen tooninstellingen gevonden. Maak een nieuwe tone aan of voer de database migratie uit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
