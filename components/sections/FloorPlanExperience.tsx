'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Link from 'next/link';

const ZONES = [
  {
    id: 'entrance', label: '01 — Ingang',
    heading: 'Zo beslissen klanten in 3 seconden of ze blijven',
    body: 'Wist je dat de eerste 3 meter van je winkel bepaalt of een klant blijft of omdraait? Wij laten je precies zien wat er beter kan — en hoe je dat morgen al kunt aanpakken.',
    stat: '✓ Resultaat vandaag nog', color: '#E87A2E',
  },
  {
    id: 'route', label: '02 — Looproute',
    heading: 'Zien je klanten je beste producten wel?',
    body: 'Klanten lopen altijd dezelfde route. Als je beste producten op de verkeerde plek staan, zien ze die nooit. Wij tekenen de ideale route uit voor jouw winkel.',
    stat: '✓ Inclusief geoptimaliseerd vloerplan', color: '#4A9EE5',
  },
  {
    id: 'shelves', label: '03 — Schappen',
    heading: 'Dit kleine verschil zorgt voor 40% meer aankopen',
    body: 'Welk product op ooghoogte? Wat bij de ingang? Wat naast de kassa? Je krijgt een kant-en-klaar plan dat je zelf kunt uitvoeren — dit weekend al.',
    stat: '✓ Persoonlijk plaatsingsplan in je dashboard', color: '#34A853',
  },
  {
    id: 'hotspots', label: '04 — Dode hoeken',
    heading: 'Plekken in je winkel die nu geld kosten',
    body: 'Bijna elke winkel heeft hoeken waar klanten nooit komen. Dat zijn gemiste verkopen. Wij laten je zien welke hoeken dat zijn en hoe je ze omtovert tot verkoopplekken.',
    stat: '✓ Heatmap + actiepunten per zone', color: '#E53E3E',
  },
  {
    id: 'checkout', label: '05 — Kassa',
    heading: 'Verdien meer zonder één product toe te voegen',
    body: 'De laatste meter voor de kassa is de meest waardevolle plek in je winkel. Wij laten je zien hoe je daar slim gebruik van maakt — gemiddeld +€8 per kassabon.',
    stat: '✓ Stap-voor-stap implementatieplan', color: '#F5A623',
  },
];

/* ── SVG Plattegrond ─────────────────────────────────────────── */
function FloorPlanSVG({ activeZone }: { activeZone: number }) {
  const zoneColor = ZONES[activeZone]?.color ?? '#E87A2E';
  const zoneId = ZONES[activeZone]?.id ?? 'entrance';

  return (
    <svg viewBox="0 0 1000 750" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="Plattegrond van een winkel met zones">
      <defs>
        <pattern id="fp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(232,228,220,0.04)" strokeWidth="0.5"/>
        </pattern>
        <radialGradient id="fp-warm" cx="50%" cy="88%" r="35%">
          <stop offset="0%" stopColor="#E87A2E" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#E87A2E" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="fp-cold-l" cx="12%" cy="55%" r="25%">
          <stop offset="0%" stopColor="#3182CE" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#3182CE" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="fp-cold-r" cx="88%" cy="55%" r="25%">
          <stop offset="0%" stopColor="#3182CE" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#3182CE" stopOpacity="0"/>
        </radialGradient>
        <filter id="fp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Floor */}
      <rect x="30" y="30" width="940" height="690" rx="4" fill="#0E0D0B" stroke="rgba(232,228,220,0.12)" strokeWidth="2"/>
      <rect x="30" y="30" width="940" height="690" fill="url(#fp-grid)"/>
      <rect x="30" y="30" width="940" height="690" fill="url(#fp-warm)"/>
      <rect x="30" y="30" width="940" height="690" fill="url(#fp-cold-l)"/>
      <rect x="30" y="30" width="940" height="690" fill="url(#fp-cold-r)"/>

      {/* Left shelves */}
      <rect x="36" y="80" width="90" height="560" rx="3" fill="#1A1917" stroke="#3A3632" strokeWidth="0.8"/>
      {[120,170,220,270,320,370,420,470,520,570].map((y,i) => (
        <line key={i} x1="36" y1={y} x2="126" y2={y} stroke="#3A3632" strokeWidth="0.5"/>
      ))}

      {/* Right shelves */}
      <rect x="874" y="80" width="90" height="560" rx="3" fill="#1A1917" stroke="#3A3632" strokeWidth="0.8"/>
      {[120,170,220,270,320,370,420,470,520,570].map((y,i) => (
        <line key={i} x1="874" y1={y} x2="964" y2={y} stroke="#3A3632" strokeWidth="0.5"/>
      ))}

      {/* Kassa */}
      <rect x="36" y="34" width="928" height="54" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.8"/>
      {[120,350,580,810].map((x,i) => (
        <rect key={i} x={x} y="40" width="70" height="36" rx="2" fill="#222120" stroke="#3A3632" strokeWidth="0.5"/>
      ))}

      {/* Display eilanden */}
      <ellipse cx="380" cy="300" rx="60" ry="44" fill="#1E1C18" stroke="#3A3632" strokeWidth="0.8"/>
      <ellipse cx="620" cy="380" rx="55" ry="40" fill="#1E1C18" stroke="#3A3632" strokeWidth="0.8"/>
      <ellipse cx="500" cy="220" rx="50" ry="36" fill="#1E1C18" stroke="#3A3632" strokeWidth="0.8"/>
      <ellipse cx="280" cy="480" rx="45" ry="34" fill="#1E1C18" stroke="#3A3632" strokeWidth="0.7"/>
      <ellipse cx="720" cy="200" rx="48" ry="36" fill="#1E1C18" stroke="#3A3632" strokeWidth="0.7"/>

      {/* Paskamers */}
      {[780,850].map((x,i) => (
        <g key={i}>
          <rect x={x} y="640" width="60" height="60" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.7"/>
          <path d={`M${x},${640+60} A24,24 0 0,1 ${x+24},${640+60}`} fill="none" stroke="#3A3632" strokeWidth="0.5"/>
        </g>
      ))}
      <text x="870" y="632" textAnchor="middle" fill="rgba(232,228,220,0.18)" fontSize="9" fontWeight="600" letterSpacing="0.1em">PASKAMERS</text>

      {/* Personeelsruimte */}
      <rect x="128" y="620" width="140" height="100" rx="2" fill="#1A1917" stroke="#3A3632" strokeWidth="0.8"/>
      <text x="198" y="675" textAnchor="middle" fill="rgba(232,228,220,0.18)" fontSize="9" fontWeight="600" letterSpacing="0.1em">PERSONEEL</text>

      {/* Looproute */}
      <path d="M500 710 L500 570 L500 430 L380 300 L300 190 L500 110 L700 190 L620 380 L500 430"
        stroke="#E87A2E" strokeWidth="3" strokeDasharray="10 6" fill="none" opacity="0.5"/>

      {/* Route dots */}
      {[[500,570],[500,430],[380,300],[300,190]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={5-i} fill="#E87A2E" opacity={0.9-i*0.15}/>
      ))}

      {/* Ingang */}
      <rect x="400" y="712" width="200" height="8" rx="2" fill="#E87A2E" opacity="0.35"/>

      {/* Zone labels */}
      <text x="81" y="365" textAnchor="middle" fill="rgba(232,228,220,0.15)" fontSize="9" letterSpacing="0.1em">SCHAPPEN</text>
      <text x="919" y="365" textAnchor="middle" fill="rgba(232,228,220,0.15)" fontSize="9" letterSpacing="0.1em">SCHAPPEN</text>
      <text x="500" y="66" textAnchor="middle" fill="rgba(232,228,220,0.18)" fontSize="9" letterSpacing="0.12em">KASSA</text>
      <text x="500" y="732" textAnchor="middle" fill="rgba(232,228,220,0.2)" fontSize="9" letterSpacing="0.15em">INGANG</text>

      {/* Zone highlight overlay */}
      {zoneId === 'entrance' && (
        <ellipse cx="500" cy="700" rx="220" ry="50" fill={zoneColor} opacity="0.12" filter="url(#fp-glow)"/>
      )}
      {zoneId === 'route' && (
        <path d="M500 710 L500 570 L500 430 L380 300 L300 190 L500 110 L700 190 L620 380 L500 430"
          stroke={zoneColor} strokeWidth="4" fill="none" opacity="0.4" filter="url(#fp-glow)"/>
      )}
      {zoneId === 'shelves' && (
        <>
          <rect x="36" y="80" width="90" height="560" fill={zoneColor} opacity="0.12" filter="url(#fp-glow)"/>
          <rect x="874" y="80" width="90" height="560" fill={zoneColor} opacity="0.12"/>
        </>
      )}
      {zoneId === 'hotspots' && (
        <>
          <ellipse cx="500" cy="700" rx="220" ry="50" fill="#E53E3E" opacity="0.14"/>
          <ellipse cx="81" cy="600" rx="100" ry="120" fill="#3182CE" opacity="0.08"/>
          <ellipse cx="919" cy="600" rx="100" ry="120" fill="#3182CE" opacity="0.08"/>
          <ellipse cx="81" cy="200" rx="80" ry="100" fill="#3182CE" opacity="0.07"/>
          <ellipse cx="919" cy="200" rx="80" ry="100" fill="#3182CE" opacity="0.07"/>
        </>
      )}
      {zoneId === 'checkout' && (
        <rect x="36" y="34" width="928" height="54" fill={zoneColor} opacity="0.15" filter="url(#fp-glow)"/>
      )}
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────── */
export default function FloorPlanExperience() {
  const [activeZone, setActiveZone] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate zone panel on change
  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [activeZone]);

  const zone = ZONES[activeZone];

  return (
    <section
      id="hero"
      style={{ background: '#111110', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: '4rem' }}
    >
      {/* Left: plattegrond */}
      <div style={{ position: 'relative', background: '#0E0D0B', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, padding: '1.5rem' }}>
          <FloorPlanSVG activeZone={activeZone} />
        </div>

        {/* Zone panel overlay */}
        <div
          ref={panelRef}
          style={{
            position: 'absolute', bottom: '1.75rem', left: '1.75rem', right: '1.75rem',
            background: 'rgba(20,19,17,0.92)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(232,228,220,0.08)',
            borderLeft: `4px solid ${zone.color}`,
            borderRadius: '14px',
            padding: 'clamp(1.25rem,3vw,2rem)',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: zone.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            {zone.label}
          </div>
          <h3 style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: 'clamp(1rem,2vw,1.25rem)', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.6rem', lineHeight: 1.25 }}>
            {zone.heading}
          </h3>
          <p style={{ fontSize: 'clamp(0.78rem,1.5vw,0.875rem)', color: 'rgba(232,228,220,0.5)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            {zone.body}
          </p>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: zone.color }}>
            {zone.stat}
          </span>
        </div>
      </div>

      {/* Right: headline + zone stepper */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(2rem,5vw,4rem) clamp(2rem,5vw,4.5rem)',
        gap: '2rem',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,122,46,0.08)', border: '1px solid rgba(232,122,46,0.16)', borderRadius: '20px', padding: '5px 14px', alignSelf: 'flex-start' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E87A2E' }}/>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E87A2E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            SMARTZONES — AI WINKELANALYSE
          </span>
        </div>

        {/* Headline */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-syne),system-ui,sans-serif',
            fontSize: 'clamp(1.9rem,3.5vw,3rem)',
            fontWeight: 800, color: '#E8E4DC',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            marginBottom: '1rem',
          }}>
            Ontdek waarom klanten<br/>
            je winkel verlaten<br/>
            <span style={{ color: '#E87A2E' }}>— en stop dat vandaag.</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem,1.6vw,1.05rem)', color: 'rgba(232,228,220,0.5)', lineHeight: 1.7, maxWidth: '42ch' }}>
            Je filmt je winkel met je telefoon. Wij analyseren alles en geven je een concreet stappenplan. Resultaat binnen 1 uur. Eenmalig €199.
          </p>
        </div>

        {/* CTA knoppen */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard/upload"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#E87A2E', color: '#fff',
              padding: '0.85rem 1.6rem', borderRadius: '10px',
              fontWeight: 600, fontSize: 'clamp(0.85rem,1.4vw,0.95rem)',
              textDecoration: 'none', boxShadow: '0 4px 18px rgba(232,122,46,0.28)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#D06820'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#E87A2E'; }}
          >
            Meer klanten in mijn winkel →
          </Link>
          <Link
            href="/demo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', color: 'rgba(232,228,220,0.55)',
              border: '1px solid rgba(232,228,220,0.14)',
              padding: '0.85rem 1.4rem', borderRadius: '10px',
              fontWeight: 500, fontSize: 'clamp(0.82rem,1.3vw,0.9rem)',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.3)'; e.currentTarget.style.color = 'rgba(232,228,220,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.14)'; e.currentTarget.style.color = 'rgba(232,228,220,0.55)'; }}
          >
            Bekijk een voorbeeld-analyse
          </Link>
        </div>

        {/* Trust labels */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {['Resultaat vandaag nog', 'Geen abonnement', 'Geld terug garantie'].map((t) => (
            <span key={t} style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.35)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#34D399' }}>✓</span>{t}
            </span>
          ))}
        </div>

        {/* Zone stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
          {ZONES.map((z, i) => (
            <button
              key={z.id}
              onClick={() => setActiveZone(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.9rem', borderRadius: '9px',
                background: activeZone === i ? `${z.color}10` : 'transparent',
                border: `1px solid ${activeZone === i ? `${z.color}25` : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: activeZone === i ? 28 : 22, height: activeZone === i ? 28 : 22,
                borderRadius: '50%', flexShrink: 0, transition: 'all 0.2s',
                background: activeZone === i ? z.color : 'transparent',
                border: `1.5px solid ${activeZone === i ? z.color : 'rgba(232,228,220,0.18)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 800,
                color: activeZone === i ? '#fff' : 'rgba(232,228,220,0.35)',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <span style={{
                fontSize: '0.82rem', fontWeight: activeZone === i ? 600 : 400,
                color: activeZone === i ? z.color : 'rgba(232,228,220,0.4)',
                transition: 'all 0.2s',
              }}>
                {z.id === 'entrance' ? 'Ingang' : z.id === 'route' ? 'Looproute' : z.id === 'shelves' ? 'Schappen' : z.id === 'hotspots' ? 'Dode hoeken' : 'Kassa'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
