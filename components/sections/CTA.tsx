'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Link from 'next/link';

const CHECKLIST = [
  { text: 'Een duidelijke tekening hoe je winkel het beste werkt', color: '#E87A2E' },
  { text: 'Precies waar je elk product neerzet voor de meeste verkoop', color: '#4A9EE5' },
  { text: 'Hoe je ervoor zorgt dat klanten meer van je winkel zien', color: '#34D399' },
  { text: 'Welke plekken nu geld kosten — en hoe je dat oplost', color: '#E53E3E' },
  { text: 'Een concrete to-do lijst — dit weekend al uitvoerbaar', color: '#F5A623' },
  { text: 'Persoonlijk dashboard — altijd terug te lezen', color: '#8B5CF6' },
];

const SOCIAL_PROOF = [
  { initials: 'F', color: '#E87A2E', bg: 'rgba(232,122,46,0.14)', quote: '"Mijn omzet steeg 23% na de analyse."', name: 'Fatima', biz: 'brasserie Rotterdam' },
  { initials: 'M', color: '#4A9EE5', bg: 'rgba(74,158,229,0.12)', quote: '"Best €199 die ik ooit uitgaf."', name: 'Mark', biz: 'fietsenwinkel Amsterdam' },
  { initials: 'S', color: '#34D399', bg: 'rgba(52,211,153,0.1)', quote: '"In één weekend mijn salon omgegooid."', name: 'Sandra', biz: 'kapsalon Utrecht' },
];

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headRef.current) {
        gsap.set(headRef.current, { opacity: 0, y: 28, filter: 'blur(6px)' });
        ScrollTrigger.create({ trigger: headRef.current, start: 'top 85%', once: true,
          onEnter: () => gsap.to(headRef.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }) });
      }
      if (proofRef.current) {
        const items = proofRef.current.querySelectorAll('.proof-item');
        gsap.set(items, { opacity: 0, y: 20 });
        ScrollTrigger.create({ trigger: proofRef.current, start: 'top 88%', once: true,
          onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }) });
      }
      if (cardRef.current) {
        const items = cardRef.current.querySelectorAll('.cta-form-field');
        gsap.set(cardRef.current, { y: 50, opacity: 0 });
        gsap.set(items, { y: 18, opacity: 0 });
        ScrollTrigger.create({ trigger: cardRef.current, start: 'top 85%', once: true,
          onEnter: () => {
            gsap.to(cardRef.current, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' });
            gsap.to(items, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, delay: 0.4, ease: 'power2.out' });
          }
        });
      }
      if (btnRef.current) {
        gsap.to(btnRef.current, { scale: 1.02, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" style={{ background: '#111110', padding: 'clamp(4rem,10vw,7rem) 0' }}>
      {/* Social proof balk */}
      <div style={{ background: '#0C0B0A', borderTop: '1px solid rgba(232,228,220,0.05)', borderBottom: '1px solid rgba(232,228,220,0.05)', padding: '1rem clamp(1.5rem,4vw,3rem)', marginBottom: 'clamp(3rem,8vw,6rem)' }}>
        <div ref={proofRef} style={{ display: 'flex', gap: 'clamp(1rem,3vw,2.5rem)', alignItems: 'center', flexWrap: 'wrap', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(232,228,220,0.22)', whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Winkeliers zeggen:
          </div>
          {SOCIAL_PROOF.map((p) => (
            <div key={p.initials} className="proof-item" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: p.color, flexShrink: 0 }}>
                {p.initials}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)', fontStyle: 'italic' }}>{p.quote}</span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(232,228,220,0.22)', whiteSpace: 'nowrap' }}>— {p.name}, {p.biz}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Header */}
        <div ref={headRef} style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,6vw,4rem)' }}>
          <span className="zone-label" style={{ display: 'block', marginBottom: '1rem' }}>Start vandaag</span>
          <h2 id="wat-je-krijgt" style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 800, color: '#E8E4DC', letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: '18ch', margin: '0 auto 1.25rem' }}>
            Je winkelanalyse voor{' '}
            <span style={{ background: 'linear-gradient(135deg,#E87A2E,#F5A623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              €199
            </span>
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem,1.6vw,1rem)', color: 'rgba(232,228,220,0.45)', maxWidth: '48ch', margin: '0 auto', lineHeight: 1.7 }}>
            Je filmt je winkel. Wij vertellen je precies wat er beter kan en hoe je dat aanpakt. Eenmalig. Geen abonnement. Geen verrassingen.
          </p>
        </div>

        {/* Pricing card */}
        <div
          ref={cardRef}
          style={{
            maxWidth: '480px', margin: '0 auto',
            background: 'rgba(22,21,19,0.85)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(232,228,220,0.09)',
            borderRadius: '20px',
            padding: 'clamp(1.75rem,4vw,3rem)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px -12px rgba(0,0,0,0.45)',
            textAlign: 'center',
          }}
        >
          {/* Demo link — eerst zien dan kopen */}
          <div className="cta-form-field">
            <Link href="/demo"
              style={{ display: 'block', border: '1px solid rgba(232,228,220,0.1)', borderRadius: '9px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'rgba(232,228,220,0.45)', textDecoration: 'none', marginBottom: '1.5rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E87A2E'; e.currentTarget.style.color = '#E87A2E'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; e.currentTarget.style.color = 'rgba(232,228,220,0.45)'; }}>
              Bekijk eerst een voorbeeld-analyse — gratis
            </Link>
          </div>

          {/* Prijs */}
          <div className="cta-form-field">
            <span style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: 'clamp(3rem,6vw,4rem)', fontWeight: 800, color: '#E87A2E', lineHeight: 1, display: 'block' }}>
              €199
            </span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(232,228,220,0.35)', marginTop: '0.35rem', display: 'block' }}>
              eenmalig, excl. BTW
            </span>
          </div>

          {/* Divider */}
          <div className="cta-form-field" style={{ width: 48, height: 1, background: 'rgba(232,228,220,0.07)', margin: '1.5rem auto' }}/>

          {/* Checklist */}
          <ul className="cta-form-field" style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.75rem' }}>
            {CHECKLIST.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.55rem 0', fontSize: '0.875rem', color: 'rgba(232,228,220,0.65)', borderBottom: i < CHECKLIST.length - 1 ? '1px solid rgba(232,228,220,0.04)' : 'none' }}>
                <span style={{ color: '#34D399', fontSize: '0.85rem', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                {item.text}
              </li>
            ))}
          </ul>

          {/* CTA knop */}
          <div className="cta-form-field">
            <Link
              href="/dashboard/upload"
              ref={btnRef}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: '#E87A2E', color: '#fff',
                padding: '1rem 2rem', borderRadius: '11px',
                fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none', width: '100%',
                boxShadow: '0 4px 18px rgba(232,122,46,0.28)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#D06820'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#E87A2E'; }}
            >
              Meer klanten in mijn winkel →
            </Link>
          </div>

          {/* Trust labels */}
          <div className="cta-form-field" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {['Resultaat vandaag nog', 'Geen abonnement', 'Geld terug garantie'].map((t) => (
              <span key={t} style={{ fontSize: '0.72rem', color: 'rgba(232,228,220,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#34D399' }}>✓</span>{t}
              </span>
            ))}
          </div>

          {/* Mollie badge */}
          <div className="cta-form-field" style={{ borderTop: '1px solid rgba(232,228,220,0.05)', paddingTop: '1rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="rgba(232,228,220,0.25)" strokeWidth="1"/><path d="M3 6l2 2 4-4" stroke="rgba(232,228,220,0.25)" strokeWidth="1" strokeLinecap="round"/></svg>
              Veilig betalen via Mollie &middot; iDEAL beschikbaar
            </span>
          </div>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'rgba(232,228,220,0.3)' }}>
            Vragen? Mail ons:{' '}
            <a href="mailto:info@smartzones.nl" style={{ color: 'rgba(232,228,220,0.5)', textDecoration: 'none', borderBottom: '1px solid rgba(232,228,220,0.18)', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E87A2E'; e.currentTarget.style.color = '#E87A2E'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.18)'; e.currentTarget.style.color = 'rgba(232,228,220,0.5)'; }}>
              info@smartzones.nl
            </a>
            {' '}— we reageren binnen 2 uur
          </span>
        </div>
      </div>
    </section>
  );
}
