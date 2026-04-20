'use client';

import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  factuurNr: string;
  client: string;
  email: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  mollie_payment_id: string | null;
  store_name: string;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  paid:    { label: 'Betaald',        bg: 'rgba(52,168,83,0.15)',  color: '#34A853' },
  pending: { label: 'In afwachting',  bg: 'rgba(245,166,35,0.15)', color: '#F5A623' },
  failed:  { label: 'Mislukt',        bg: 'rgba(229,62,62,0.15)',  color: '#E53E3E' },
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    fetch('/api/admin/invoices')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setInvoices(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.email.toLowerCase().includes(search.toLowerCase()) ||
      inv.factuurNr.toLowerCase().includes(search.toLowerCase()) ||
      inv.store_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>Facturen</h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>Alle betalingen uit uw platform</p>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Totaal betaald',    value: `€${totalPaid.toLocaleString()}`,   border: '#34A853' },
          { label: 'In afwachting',     value: `€${totalPending.toLocaleString()}`, border: '#F5A623' },
          { label: 'Totaal facturen',   value: String(invoices.length),             border: '#4A9EE5' },
        ].map((k, i) => (
          <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${k.border}` }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.45)', display: 'block', marginBottom: '0.4rem' }}>{k.label}</span>
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E4DC' }}>{loading ? '...' : k.value}</span>
          </div>
        ))}
      </div>

      {/* Filter + zoek */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoeken op naam, e-mail, factuurnummer..."
          style={{ flex: 1, minWidth: '220px', background: 'rgba(232,228,220,0.05)', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#E8E4DC', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
        />
        {(['all', 'paid', 'pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? '#E87A2E' : 'rgba(232,228,220,0.08)', color: filter === f ? '#fff' : 'rgba(232,228,220,0.6)' }}>
            {f === 'all' ? 'Alle' : f === 'paid' ? 'Betaald' : 'In afwachting'}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div style={cardStyle}>
        {loading ? (
          <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.9rem' }}>Laden...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.9rem' }}>Geen facturen gevonden.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(232,228,220,0.08)' }}>
                  {['Factuurnr.', 'Klant', 'Winkel', 'Datum', 'Bedrag', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'rgba(232,228,220,0.35)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const st = statusConfig[inv.status] || statusConfig.pending;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(232,228,220,0.04)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', color: 'rgba(232,228,220,0.5)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{inv.factuurNr}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ color: '#E8E4DC', fontWeight: 500 }}>{inv.client}</div>
                        <div style={{ color: 'rgba(232,228,220,0.35)', fontSize: '0.75rem' }}>{inv.email}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: 'rgba(232,228,220,0.6)' }}>{inv.store_name}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: 'rgba(232,228,220,0.5)', whiteSpace: 'nowrap' }}>{new Date(inv.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#E8E4DC', fontWeight: 600 }}>€{inv.amount.toFixed(2)}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ background: st.bg, color: st.color, fontSize: '0.7rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '4px' }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {inv.mollie_payment_id && (
                          <a href={`https://www.mollie.com/dashboard/payments/${inv.mollie_payment_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#E87A2E', fontSize: '0.75rem', textDecoration: 'none' }}>
                            Mollie →
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
