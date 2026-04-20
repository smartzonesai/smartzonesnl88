'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Nieuwe analyse',
    href: '/dashboard/upload',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3v10M6 7l4-4 4 4" />
        <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
      </svg>
    ),
  },
  {
    label: 'Mijn analyses',
    href: '/dashboard/analyses',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h14M3 10h14M3 15h10" />
      </svg>
    ),
  },
  {
    label: 'Instellingen',
    href: '/dashboard/settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 1.5v2M10 16.5v2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M1.5 10h2M16.5 10h2M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    // Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }
      setEmail(session.user.email || '');
      setReady(true);
    });

    // Listen for auth state changes (e.g. token expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#111110', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(232,228,220,0.3)', fontFamily: 'var(--font-dm-sans)' }}>Laden...</span>
      </div>
    );
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: '2rem 1.75rem 2.5rem' }}>
        <a href="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-syne), system-ui, sans-serif', fontWeight: 700, fontSize: '1.35rem', color: '#E8E4DC' }}>
            Smart Zones<span style={{ color: '#E87A2E' }}>.</span>
          </span>
        </a>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0.75rem' }}>
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? currentPath === '/dashboard'
            : currentPath.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '0.25rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#E87A2E' : 'rgba(232, 228, 220, 0.55)',
                background: isActive ? 'rgba(232, 122, 46, 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #E87A2E' : '3px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(232, 228, 220, 0.8)';
                  e.currentTarget.style.background = 'rgba(232, 228, 220, 0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(232, 228, 220, 0.55)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div style={{ padding: '1.5rem 1.75rem', borderTop: '1px solid rgba(232, 228, 220, 0.06)' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(232, 228, 220, 0.45)', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: '0.6rem 1rem', background: 'rgba(232, 228, 220, 0.04)', border: '1px solid rgba(232, 228, 220, 0.08)', borderRadius: '8px', color: 'rgba(232, 228, 220, 0.55)', fontSize: '0.8rem', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232, 228, 220, 0.08)'; e.currentTarget.style.color = '#E8E4DC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(232, 228, 220, 0.04)'; e.currentTarget.style.color = 'rgba(232, 228, 220, 0.55)'; }}
        >
          Uitloggen
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#111110' }}>
      {/* Desktop Sidebar */}
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: '#0E0D0B', borderRight: '1px solid rgba(232, 228, 220, 0.06)', display: 'flex', flexDirection: 'column', zIndex: 50 }} className="dashboard-sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="dashboard-hamburger"
        aria-label="Menu openen"
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 60, width: '44px', height: '44px', background: 'rgba(14, 13, 11, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(232, 228, 220, 0.1)', borderRadius: '10px', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#E8E4DC' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {mobileOpen ? (<><path d="M4 4l12 12" /><path d="M16 4L4 16" /></>) : (<><path d="M3 5h14" /><path d="M3 10h14" /><path d="M3 15h14" /></>)}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 49 }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className="dashboard-sidebar-mobile" style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: '#0E0D0B', borderRight: '1px solid rgba(232, 228, 220, 0.06)', display: 'none', flexDirection: 'column', zIndex: 55, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="dashboard-main" style={{ marginLeft: '280px', minHeight: '100vh', background: '#111110', padding: 'clamp(2rem, 4vw, 3rem)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #E87A2E, rgba(232, 122, 46, 0) 60%)' }} />
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar-desktop { display: none !important; }
          .dashboard-hamburger { display: flex !important; }
          .dashboard-sidebar-mobile { display: flex !important; }
          .dashboard-main { margin-left: 0 !important; padding-top: 4.5rem !important; }
        }
      `}</style>
    </div>
  );
}
