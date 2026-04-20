'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  email: string;
  store_name: string;
  store_type: string;
  analyses: number;
  completed: number;
  total_spent: number;
  last_active: string;
  first_seen: string;
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setClients(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    !search ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.store_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>Klanten</h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>{clients.length} klant{clients.length !== 1 ? 'en' : ''} totaal</p>
      </div>

      {/* Zoekbalk */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoeken op e-mail of winkelnaam..."
          style={{ width: '100%', background: 'rgba(232,228,220,0.05)', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#E8E4DC', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>

      {/* Klantenlijst */}
      <div style={cardStyle}>
        {loading ? (
          <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.9rem' }}>Laden...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.9rem' }}>Geen klanten gevonden.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((client, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(232,228,220,0.02)', borderRadius: '10px', border: '1px solid rgba(232,228,220,0.06)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(232,122,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E87A2E' }}>{client.email[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E8E4DC', margin: 0 }}>{client.store_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)', margin: 0 }}>{client.email}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#E87A2E', margin: 0 }}>{client.analyses}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', margin: 0 }}>analyses</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#34A853', margin: 0 }}>€{client.total_spent}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.35)', margin: 0 }}>besteed</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.35)', margin: 0 }}>Laatste activiteit</p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.6)', margin: 0 }}>
                      {new Date(client.last_active).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(74,158,229,0.15)', color: '#4A9EE5' }}>
                    {client.store_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
