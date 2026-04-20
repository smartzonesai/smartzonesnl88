'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const FEATURES = [
  { color: '#E87A2E', title: 'Gewoon je telefoon', body: 'Je hebt geen speciale apparatuur nodig. Als je een video kunt opnemen, kun je dit gebruiken.', tag: '✓ Geen technische kennis nodig' },
  { color: '#4A9EE5', title: 'Getest in 10.000+ winkels', body: 'Onze AI heeft patronen geleerd van duizenden winkels — van kappers tot supermarkten tot boetieks.', tag: '✓ Bewezen methode' },
  { color: '#34D399', title: 'Resultaat vandaag nog', body: 'Upload je video en binnen 1 uur staat je complete analyse klaar in je persoonlijk dashboard.', tag: '✓ Binnen 1 uur klaar' },
  { color: '#F5A623', title: 'Je voert het zelf uit', body: 'Het plan is zo concreet dat je geen expert nodig hebt. Stap voor stap, dit weekend al uitvoerbaar.', tag: '✓ Geen aannemer nodig' },
];

const card: React.CSSProperties = {
  background: 'rgba(26,25,23,0.6)',
  border: '1px solid rgba(232,228,220,0.07)',
  borderRadius: '12px',
  padding: '1.4rem 1.6rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'border-color 0.3s, transform 0.3s',
  cursor: 'default',
};

export default function AI() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headRef.current) {
        gsap.set(headRef.current, { opacity: 0, y: 24 });
        ScrollTrigger.create({ trigger: headRef.current, start: 'top 85%', once: true,
          onEnter: () => gsap.to(headRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }) });
      }
      if (leftRef.current) {
        gsap.set(leftRef.current, { opacity: 0, x: -30 });
        ScrollTrigger.create({ trigger: leftRef.current, start: 'top 80%', once: true,
          onEnter: () => gsap.to(leftRef.current, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }) });
      }
      if (rightRef.current) {
        const cards = rightRef.current.querySelectorAll('.ai-card');
        gsap.set(cards, { opacity: 0, y: 30 });
        ScrollTrigger.create({ trigger: rightRef.current, start: 'top 80%', once: true,
          onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }) });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="waarom" style={{ background: '#0E0D0B', padding: 'clamp(4rem,10vw,7rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div ref={headRef} style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,6vw,4rem)' }}>
          <span className="zone-label" style={{ display: 'block', marginBottom: '1rem' }}>Waarom het werkt</span>
          <h2 style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 800, color: '#E8E4DC', letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: '22ch', margin: '0 auto 1rem' }}>
            Hetzelfde systeem als grote ketens — nu voor jouw winkel
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem,1.6vw,1rem)', color: 'rgba(232,228,220,0.45)', maxWidth: '50ch', margin: '0 auto', lineHeight: 1.7 }}>
            Grote ketens zoals H&M en IKEA betalen tienduizenden euro&apos;s voor winkellayout-onderzoek. Wij doen hetzelfde voor €199. Zonder gedoe. Zonder consultants.
          </p>
        </div>

        {/* Two-column: before/after + features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,5vw,4rem)', alignItems: 'start' }}>

          {/* Before / after visual */}
          <div ref={leftRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

              {/* Huidig */}
              <div style={{ background: 'rgba(26,25,23,0.6)', border: '1px solid rgba(232,228,220,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#1A1917', padding: '7px 12px', fontSize: '9px', fontWeight: 700, color: 'rgba(232,228,220,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(232,228,220,0.04)' }}>Nu</div>
                <svg viewBox="0 0 180 140" style={{ width: '100%' }} fill="none">
                  <rect width="180" height="140" fill="#111110"/>
                  <rect x="10" y="10" width="24" height="110" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.6"/>
                  <line x1="10" y1="30" x2="34" y2="30" stroke="#3A3632" strokeWidth="0.4"/>
                  <line x1="10" y1="50" x2="34" y2="50" stroke="#3A3632" strokeWidth="0.4"/>
                  <line x1="10" y1="70" x2="34" y2="70" stroke="#3A3632" strokeWidth="0.4"/>
                  <line x1="10" y1="90" x2="34" y2="90" stroke="#3A3632" strokeWidth="0.4"/>
                  <rect x="146" y="10" width="24" height="110" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.6"/>
                  <line x1="146" y1="30" x2="170" y2="30" stroke="#3A3632" strokeWidth="0.4"/>
                  <line x1="146" y1="50" x2="170" y2="50" stroke="#3A3632" strokeWidth="0.4"/>
                  <rect x="10" y="6" width="160" height="14" rx="1.5" fill="#1A1917" stroke="#3A3632" strokeWidth="0.6"/>
                  <ellipse cx="68" cy="118" rx="48" ry="14" fill="#E53E3E" opacity="0.08"/>
                  <ellipse cx="22" cy="78" rx="16" ry="38" fill="#3182CE" opacity="0.07"/>
                  <ellipse cx="158" cy="78" rx="16" ry="38" fill="#3182CE" opacity="0.07"/>
                  <text x="90" y="121" textAnchor="middle" fill="rgba(229,62,62,0.35)" fontSize="6">weinig verkeer</text>
                  <text x="22" y="78" textAnchor="middle" fill="rgba(49,130,206,0.4)" fontSize="5">dood</text>
                  <text x="158" y="78" textAnchor="middle" fill="rgba(49,130,206,0.4)" fontSize="5">dood</text>
                </svg>
              </div>

              {/* Na Smart Zones */}
              <div style={{ background: 'rgba(26,25,23,0.6)', border: '1px solid rgba(232,122,46,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ background: 'rgba(232,122,46,0.07)', padding: '7px 12px', fontSize: '9px', fontWeight: 700, color: '#E87A2E', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(232,122,46,0.08)' }}>Na Smart Zones</div>
                <svg viewBox="0 0 180 140" style={{ width: '100%' }} fill="none">
                  <rect width="180" height="140" fill="#111110"/>
                  <rect x="10" y="10" width="24" height="110" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.6"/>
                  <rect x="146" y="10" width="24" height="110" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.6"/>
                  <rect x="10" y="6" width="160" height="14" rx="1.5" fill="#1A1917" stroke="#3A3632" strokeWidth="0.6"/>
                  <ellipse cx="90" cy="120" rx="60" ry="14" fill="#E87A2E" opacity="0.15"/>
                  <ellipse cx="22" cy="72" rx="18" ry="42" fill="#34A853" opacity="0.1"/>
                  <ellipse cx="158" cy="72" rx="18" ry="42" fill="#34A853" opacity="0.1"/>
                  <path d="M90 130 L90 96 L68 68 L55 44 L90 22 L125 44 L112 68 L90 96" stroke="#E87A2E" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.6"/>
                  <circle cx="90" cy="96" r="3.5" fill="#E87A2E" opacity="0.9"/>
                  <circle cx="68" cy="68" r="2.8" fill="#E87A2E" opacity="0.7"/>
                  <text x="22" y="72" textAnchor="middle" fill="rgba(52,168,83,0.65)" fontSize="5">+klanten</text>
                  <text x="158" y="72" textAnchor="middle" fill="rgba(52,168,83,0.65)" fontSize="5">+klanten</text>
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(232,228,220,0.2)', textAlign: 'center' }}>
              Schematische weergave — jouw winkel ziet er anders uit
            </p>

            {/* Quote */}
            <div style={{ background: 'rgba(20,19,17,0.7)', border: '1px solid rgba(232,228,220,0.07)', borderLeft: '3px solid #8B5CF6', borderRadius: '0 12px 12px 0', padding: '1.25rem 1.5rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.92rem', color: 'rgba(232,228,220,0.65)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                &ldquo;Ik dacht dat ik alles wist van mijn eigen winkel. Na de analyse bleek dat 40% van mijn klanten een hele afdeling nooit zag. In één weekend opgelost.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#8B5CF6' }}>K</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E8E4DC' }}>Karin van den Berg</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.3)' }}>Eigenaar boetiek, Eindhoven</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div ref={rightRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="ai-card" style={card}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${f.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(to right,${f.color},transparent)`, opacity: 0.55 }}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }}/>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E8E4DC' }}>{f.title}</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.5)', lineHeight: 1.6, marginBottom: '0.75rem', paddingLeft: '1.1rem' }}>
                  {f.body}
                </p>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: `${f.color}10`, color: f.color, marginLeft: '1.1rem' }}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
