'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

const statsRow1 = [
  '50+ winkels geholpen',
  'Gem. +23% conversie',
  '15 jaar ervaring',
  '\u20AC2.4M extra omzet gerealiseerd',
  'Noord-Brabant #1',
];

const statsRow2 = [
  'Data-gedreven aanpak',
  'Resultaat in 4 weken',
  'Geen camera\u2019s nodig',
  'Vrijblijvende audit',
  'Bewezen methode',
];

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden py-3">
      <div className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}>
        <div className="flex whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[length:var(--text-sm)] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                {item}
              </span>
              <span className="mx-6 text-[var(--color-accent)] text-lg">&middot;</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Marquee() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // No GSAP animations for marquee — using CSS animations instead
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[var(--color-surface)] py-5 overflow-hidden z-10 relative"
    >
      <MarqueeRow items={statsRow1} />
      <MarqueeRow items={statsRow2} reverse />
    </section>
  );
}
