'use client';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const monthlyData = [
  { month: 'Sep \'25', revenue: 0, costs: 320, profit: -320, analyses: 0 },
  { month: 'Okt', revenue: 1990, costs: 450, profit: 1540, analyses: 10 },
  { month: 'Nov', revenue: 3980, costs: 520, profit: 3460, analyses: 20 },
  { month: 'Dec', revenue: 5970, costs: 610, profit: 5360, analyses: 30 },
  { month: 'Jan \'26', revenue: 7960, costs: 680, profit: 7280, analyses: 40 },
  { month: 'Feb', revenue: 11940, costs: 750, profit: 11190, analyses: 60 },
  { month: 'Mrt', revenue: 15920, costs: 820, profit: 15100, analyses: 80 },
];

const costBreakdown = [
  { category: 'Claude API', amount: 340, pct: 41 },
  { category: 'Supabase', amount: 125, pct: 15 },
  { category: 'Vercel Hosting', amount: 80, pct: 10 },
  { category: 'Domein & SSL', amount: 25, pct: 3 },
  { category: 'Marketing', amount: 200, pct: 24 },
  { category: 'Overig', amount: 50, pct: 6 },
];

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

export default function FinancialsPage() {
  const totalRevenue = monthlyData.reduce((a, b) => a + b.revenue, 0);
  const totalCosts = monthlyData.reduce((a, b) => a + b.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>
          Financieel Overzicht
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
          Omzet, kosten en winstgevendheid
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Totale Omzet', value: `€${totalRevenue.toLocaleString()}`, color: '#E87A2E' },
          { label: 'Totale Kosten', value: `€${totalCosts.toLocaleString()}`, color: '#E53E3E' },
          { label: 'Netto Winst', value: `€${totalProfit.toLocaleString()}`, color: '#34A853' },
          { label: 'Winstmarge', value: `${margin}%`, color: '#4A9EE5' },
          { label: 'Kosten per Analyse', value: `€${totalCosts > 0 ? Math.round(totalCosts / 240) : 0}`, color: '#F5A623' },
          { label: 'Omzet per Analyse', value: '€199', color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${s.color}` }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.45)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E4DC' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Revenue vs Costs vs Profit */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>
          Omzet, Kosten & Winst (Maandelijks)
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E87A2E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E87A2E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34A853" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34A853" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.06)" />
            <XAxis dataKey="month" stroke="rgba(232,228,220,0.3)" fontSize={12} />
            <YAxis stroke="rgba(232,228,220,0.3)" fontSize={12} tickFormatter={(v) => `€${v >= 1000 ? `${v / 1000}k` : v}`} />
            <Tooltip contentStyle={{ background: '#1A1917', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            <Area type="monotone" dataKey="revenue" stroke="#E87A2E" strokeWidth={2} fill="url(#revGrad2)" name="Omzet" />
            <Area type="monotone" dataKey="profit" stroke="#34A853" strokeWidth={2} fill="url(#profitGrad)" name="Winst" />
            <Line type="monotone" dataKey="costs" stroke="#E53E3E" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Kosten" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>
            Kostenbreakdown (Deze Maand)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {costBreakdown.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.7)' }}>{c.category}</span>
                  <span style={{ fontSize: '0.85rem', color: '#E8E4DC', fontWeight: 600 }}>€{c.amount}</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(232,228,220,0.06)', borderRadius: 3 }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: '#E87A2E', borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(232,228,220,0.06)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(232,228,220,0.5)', fontWeight: 600 }}>Totaal</span>
            <span style={{ fontSize: '0.9rem', color: '#E8E4DC', fontWeight: 700 }}>€{costBreakdown.reduce((a, b) => a + b.amount, 0)}</span>
          </div>
        </div>

        {/* Analyses Growth */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>
            Cumulatieve Analyses
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData.filter(d => d.analyses > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.06)" />
              <XAxis dataKey="month" stroke="rgba(232,228,220,0.3)" fontSize={12} />
              <YAxis stroke="rgba(232,228,220,0.3)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1A1917', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="analyses" stroke="#4A9EE5" strokeWidth={2.5} dot={{ fill: '#4A9EE5', r: 4 }} name="Analyses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
