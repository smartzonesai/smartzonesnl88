'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Hoe het werkt', href: '#hoe-het-werkt' },
  { label: 'Wat je krijgt', href: '#wat-je-krijgt' },
  { label: 'Waarom het werkt', href: '#waarom' },
  { label: 'Prijzen', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLink: React.CSSProperties = {
    fontSize: '0.82rem', color: 'rgba(232,228,220,0.45)', textDecoration: 'none',
    fontWeight: 500, transition: 'color 0.2s',
  };

  return (
    <nav
      className="fixed left-0 top-0 z-40 w-full transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(17,17,16,0.96)' : 'rgba(17,17,16,0.7)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(232,228,220,0.07)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: '#E8E4DC', textDecoration: 'none' }}>
          SMARTZONES<span style={{ color: '#E87A2E', fontWeight: 900 }}>.</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => navClick(e, l.href)} style={navLink}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(232,228,220,0.85)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(232,228,220,0.45)'; }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden md:inline-flex" style={{ fontSize: '0.79rem', color: 'rgba(232,228,220,0.4)', textDecoration: 'none', border: '1px solid rgba(232,228,220,0.1)', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 500, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(232,228,220,0.7)'; e.currentTarget.style.borderColor = 'rgba(232,228,220,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(232,228,220,0.4)'; e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}>
            Mijn dashboard
          </Link>

          <a href="#contact" onClick={(e) => navClick(e, '#contact')} style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', backgroundColor: '#E87A2E', padding: '0.5rem 1.1rem', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D06820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E87A2E'; }}>
            Gratis demo bekijken
          </a>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(232,228,220,0.7)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen
                ? <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                : <><line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="3" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'rgba(14,13,11,0.98)', borderTop: '1px solid rgba(232,228,220,0.07)', padding: '1rem 1.5rem 1.5rem' }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => navClick(e, l.href)}
              style={{ display: 'block', fontSize: '1rem', color: 'rgba(232,228,220,0.65)', textDecoration: 'none', padding: '0.75rem 0', borderBottom: '1px solid rgba(232,228,220,0.05)' }}>
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: '1px solid rgba(232,228,220,0.12)', borderRadius: '8px', color: 'rgba(232,228,220,0.55)', textDecoration: 'none', fontSize: '0.9rem' }}>
              Mijn dashboard
            </Link>
            <a href="#contact" onClick={(e) => navClick(e, '#contact')} style={{ display: 'block', textAlign: 'center', padding: '0.85rem', background: '#E87A2E', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              Gratis demo bekijken
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
