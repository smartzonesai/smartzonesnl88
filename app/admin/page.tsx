'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const storeTypeColors: Record<string, string> = {
  'Mode': '#E87A2E',
  'Supermarkt': '#4A9EE5',
  'Woonwinkel': '#34A853',
  'Electronica': '#F5A623',
  'Overig': '#8B5CF6',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(26, 25, 23, 0.5)',
  border: '1px solid rgba(232, 228, 220, 0.06)',
  borderRadius: '14px',
  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: '#1A1917', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem' }}>
      <p style={{ color: 'rgba(232,228,220,0.6)', marginBottom: '0.35rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.name === 'Omzet' ? `€${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
};

interface AnalysisSummary {
  id: string;
  store_name: string;
  store_type: string;
  status: string;
  created_at: string;
  paid: boolean;
}

export default function AdminOverview() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/client-analyses')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAnalyses(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Derived real stats
  const totalAnalyses = analyses.length;
  const completedAnalyses = analyses.filter(a => a.status === 'complete').length;
  const paidAnalyses = analyses.filter(a => a.paid).length;
  const totalRevenue = paidAnalyses * 199;
  const uniqueClients = new Set(analyses.map(a => a.store_name)).size;

  // Revenue per week (last 8 weeks)
  const revenueByWeek = (() => {
    const weeks: Record<string, number> = {};
    analyses.filter(a => a.paid).forEach(a => {
      const d = new Date(a.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = `W${weekStart.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`;
      weeks[key] = (weeks[key] || 0) + 199;
    });
    const sorted = Object.entries(weeks).slice(-8);
    return sorted.length > 0 ? sorted.map(([week, revenue]) => ({ week, Omzet: revenue })) : [{ week: 'Geen data', Omzet: 0 }];
  })();

  // Analyses per week
  const analysesByWeek = (() => {
    const weeks: Record<string, number> = {};
    analyses.forEach(a => {
      const d = new Date(a.created_at);
      const weekNum = Math.ceil(d.getDate() / 7);
      const key = `W${weekNum} ${d.toLocaleDateString('nl-NL', { month: 'short' })}`;
      weeks[key] = (weeks[key] || 0) + 1;
    });
    const sorted = Object.entries(weeks).slice(-8);
    return sorted.length > 0 ? sorted.map(([week, count]) => ({ week, Analyses: count })) : [{ week: 'Geen data', Analyses: 0 }];
  })();

  // Store type distribution
  const storeTypeData = (() => {
    const counts: Record<string, number> = {};
    analyses.forEach(a => { counts[a.store_type] = (counts[a.store_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: storeTypeColors[name] || '#8B5CF6' }));
  })();

  // Recent activity
  const recentActivity = analyses.slice(0, 5).map(a => ({
    action: a.status === 'complete' ? 'Analyse voltooid' : a.status === 'processing' ? 'Analyse gestart' : 'Analyse ontvangen',
    client: a.store_name,
    time: new Date(a.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    color: a.status === 'complete' ? '#34A853' : a.status === 'processing' ? '#E87A2E' : '#4A9EE5',
  }));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC' }}>
          Dashboard Overzicht
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
          Live data uit uw platform
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Totale Omzet', value: `€${totalRevenue.toLocaleString()}`, border: '#E87A2E' },
          { label: 'Unieke Klanten', value: String(uniqueClients), border: '#4A9EE5' },
          { label: 'Totaal Analyses', value: String(totalAnalyses), border: '#34A853' },
          { label: 'Voltooid', value: String(completedAnalyses), border: '#F5A623' },
          { label: 'Betaald', value: String(paidAnalyses), border: '#8B5CF6' },
        ].map((kpi, i) => (
          <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${kpi.border}` }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.45)', display: 'block', marginBottom: '0.5rem' }}>{kpi.label}</span>
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', fontWeight: 800, color: '#E8E4DC', display: 'block' }}>
              {loading ? '...' : kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue chart */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>Omzet per week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueByWeek}>
              <defs>
                <linearGradient id="omzetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E87A2E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E87A2E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.06)"/>
              <XAxis dataKey="week" tick={{ fill: 'rgba(232,228,220,0.4)', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: 'rgba(232,228,220,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`}/>
              <Tooltip content={<CustomTooltip />}/>
              <Area type="monotone" dataKey="Omzet" stroke="#E87A2E" strokeWidth={2} fill="url(#omzetGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Analyses per week */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>Analyses per week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analysesByWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.06)"/>
              <XAxis dataKey="week" tick={{ fill: 'rgba(232,228,220,0.4)', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: 'rgba(232,228,220,0.4)', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey="Analyses" fill="#4A9EE5" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Store type pie */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>Type winkels</h3>
          {storeTypeData.length === 0 ? (
            <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.85rem' }}>Geen data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={storeTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {storeTypeData.map((entry, index) => <Cell key={index} fill={entry.color}/>)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} analyses`, '']}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {storeTypeData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'rgba(232,228,220,0.6)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }}/>
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent activity */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1.25rem' }}>Recente activiteit</h3>
          {recentActivity.length === 0 ? (
            <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.85rem' }}>Geen activiteit</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentActivity.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: '0.35rem', boxShadow: `0 0 6px ${item.color}60` }}/>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', color: '#E8E4DC', fontWeight: 500, marginBottom: '0.1rem' }}>{item.action}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)' }}>{item.client} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
