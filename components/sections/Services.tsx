'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const services = [
  {
    number: '01',
    title: 'Klantstroomanalyse',
    description:
      'We meten exact hoe klanten door uw winkel bewegen: waar ze stoppen, doorlopen en afhaken. Met observatie en data, geen camera\u2019s.',
  },
  {
    number: '02',
    title: 'Zone-optimalisatie',
    description:
      'We identificeren dode zones, hotspots en knelpunten. Elke vierkante meter krijgt een doel en een functie.',
  },
  {
    number: '03',
    title: 'Herontwerp vloerplan',
    description:
      'Een nieuw vloerplan op basis van data. Productplaatsing, routing, zichtlijnen \u2014 alles klopt.',
  },
  {
    number: '04',
    title: 'Implementatie & meting',
    description:
      'We begeleiden de verbouwing en meten het resultaat na 4 en 12 weken. Geen giswerk.',
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = listRef.current?.querySelectorAll('.service-row');
      if (rows) {
        gsap.set(rows, { x: -40, opacity: 0 });
        ScrollTrigger.create({
          trigger: listRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(rows, {
              x: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-[var(--space-section)] overflow-hidden z-10 relative"
    >
      <div className="container">
        {/* Label */}
        <span className="block text-[length:var(--text-xs)] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-[var(--space-element)]">
          Onze aanpak
        </span>

        {/* Headline */}
        <h2 className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-3xl)] leading-[1.1] max-w-[22ch] mb-[var(--space-component)]">
          {'Van inzicht naar resultaat in 4 weken'.split(' ').map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em]">{word}</span>
          ))}
        </h2>

        {/* Services list */}
        <div ref={listRef} className="border-t border-[var(--color-border)]">
          {services.map((service, i) => (
            <div
              key={i}
              className="service-row group border-b border-[var(--color-border)] py-6 md:py-8 cursor-default rounded-lg transition-colors duration-300 hover:bg-[var(--color-surface)] px-4 -mx-4"
            >
              <div className="grid grid-cols-12 gap-[var(--grid-gap)] items-start">
                {/* Number */}
                <div className="col-span-2 md:col-span-1">
                  <span className="text-[length:var(--text-xl)] font-[family-name:var(--font-fraunces)] text-[var(--color-accent)]">
                    {service.number}
                  </span>
                </div>

                {/* Title */}
                <div className="col-span-8 md:col-span-5">
                  <h3 className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-xl)] leading-tight group-hover:translate-x-2 transition-transform duration-300">
                    {service.title.split(' ').map((word, j) => (
                      <span key={j} className="inline-block mr-[0.25em]">{word}</span>
                    ))}
                  </h3>
                </div>

                {/* Description — visible on mobile, hover-reveal on desktop */}
                <div className="col-span-12 md:col-span-5 mt-3 md:mt-0">
                  <p className="text-[length:var(--text-base)] text-[var(--color-text-muted)] leading-relaxed md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {service.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="col-span-2 md:col-span-1 flex justify-end items-start">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all duration-300"
                  >
                    <path
                      d="M4 10H16M16 10L11 5M16 10L11 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
