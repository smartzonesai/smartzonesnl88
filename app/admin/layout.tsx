'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overzicht', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/financials', label: 'Financiën', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/admin/clients', label: 'Klanten', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/admin/invoices', label: 'Facturen', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/lead-gen', label: 'Lead Generation AI', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { href: '/admin/market-research', label: 'Marktonderzoek AI', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { href: '/admin/outreach', label: 'Cold Outreach AI', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/admin/settings', label: 'Instellingen', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin is protected by Basic Auth in middleware — no client-side redirect needed
  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A09' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '260px', minHeight: '100vh', background: '#0E0D0B',
        borderRight: '1px solid rgba(232,228,220,0.06)', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="admin-sidebar">
        <div style={{ padding: '1.75rem 1.5rem 2rem' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#E8E4DC' }}>
              Smart Zones<span style={{ color: '#E87A2E' }}>.</span>
            </span>
          </Link>
          <div style={{ marginTop: '0.35rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,228,220,0.3)' }}>
            Admin
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.9rem', borderRadius: '8px', marginBottom: '2px',
              textDecoration: 'none', fontSize: '0.875rem',
              fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
              fontWeight: isActive(item.href) ? 600 : 400,
              color: isActive(item.href) ? '#E87A2E' : 'rgba(232,228,220,0.5)',
              background: isActive(item.href) ? 'rgba(232,122,46,0.08)' : 'transparent',
              borderLeft: isActive(item.href) ? '2px solid #E87A2E' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(232,228,220,0.06)', fontSize: '0.75rem', color: 'rgba(232,228,220,0.25)' }}>
          SmartZones Admin v1.0
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="admin-hamburger" style={{
        position: 'fixed', top: '1rem', left: '1rem', zIndex: 60,
        width: '40px', height: '40px', background: 'rgba(14,13,11,0.95)',
        border: '1px solid rgba(232,228,220,0.1)', borderRadius: '8px',
        display: 'none', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#E8E4DC',
      }} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {/* Main content */}
      <main className="admin-main" style={{ marginLeft: '260px', flex: 1, padding: 'clamp(1.5rem, 3vw, 2.5rem)', minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
          .admin-hamburger { display: flex !important; }
          .admin-main { margin-left: 0 !important; padding-top: 4rem !important; }
        }
      `}</style>
    </div>
  );
}
