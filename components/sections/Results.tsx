'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const caseStudies = [
  {
    title: 'Modezaak Breda',
    stat: '+23%',
    statLabel: 'conversie',
    statNum: 23,
    statPrefix: '+',
    statSuffix: '%',
    description:
      'Na herinrichting van de looproute en verplaatsing van de paskamers. Van 18% naar 22.1% conversie in 3 maanden.',
    location: 'Breda',
    image: '/images/case-fashion.png',
    imageAlt: 'Modezaak interieur in Breda na herinrichting door Smart Zones',
  },
  {
    title: 'Supermarkt Eindhoven',
    stat: '+\u20AC4.200',
    statLabel: 'per week',
    statNum: 4200,
    statPrefix: '+\u20AC',
    statSuffix: '',
    description:
      'Zone-optimalisatie en betere productplaatsing bij de ingang. Gemiddeld bonbedrag steeg 12%.',
    location: 'Eindhoven',
    image: '/images/case-supermarket.png',
    imageAlt: 'Supermarkt interieur in Eindhoven na zone-optimalisatie',
  },
  {
    title: 'Woonwinkel Tilburg',
    stat: '+31%',
    statLabel: 'verblijftijd',
    statNum: 31,
    statPrefix: '+',
    statSuffix: '%',
    description:
      'Intu\u00EFtief looppad met rustpunten. Klanten bleven langer, omzet steeg 18%.',
    location: 'Tilburg',
    image: '/images/case-home.png',
    imageAlt: 'Woonwinkel interieur in Tilburg met geoptimaliseerd looppad',
  },
];

export default function Results() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPanel, setCurrentPanel] = useState(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelsRef.current;
      if (!panels) return;

      const panelEls = panels.querySelectorAll('.case-panel');
      const totalPanels = panelEls.length;
      const panelWidth = panelEls[0]?.getBoundingClientRect().width || 0;
      const gap = 32;
      const totalWidth = (panelWidth + gap) * totalPanels - gap;
      const scrollDistance = totalWidth - window.innerWidth + 200;

      // Horizontal scroll with pin
      const scrollTween = gsap.to(panels, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          pinSpacing: true,
          onUpdate: (self) => {
            const panelIndex = Math.min(
              Math.floor(self.progress * totalPanels) + 1,
              totalPanels
            );
            setCurrentPanel(panelIndex);
          },
        },
      });

      // Clip-path reveal for each panel image when it enters viewport
      imageRefs.current.forEach((imgWrap, i) => {
        if (!imgWrap) return;
        gsap.set(imgWrap, { clipPath: 'inset(100% 0 0 0)' });

        ScrollTrigger.create({
          trigger: panelEls[i],
          start: 'left 80%',
          containerAnimation: scrollTween,
          once: true,
          onEnter: () => {
            gsap.to(imgWrap, {
              clipPath: 'inset(0% 0 0 0)',
              duration: 0.8,
              ease: 'power2.out',
            });
          },
        });
      });

      // Stats count up when panel enters view
      statRefs.current.forEach((el, i) => {
        if (!el) return;
        const study = caseStudies[i];

        ScrollTrigger.create({
          trigger: panelEls[i],
          start: 'left 70%',
          containerAnimation: scrollTween,
          once: true,
          onEnter: () => {
            gsap.fromTo(
              { val: 0 },
              { val: study.statNum },
              {
                val: study.statNum,
                duration: 1.5,
                ease: 'power2.out',
                onUpdate: function () {
                  const current = Math.round(this.targets()[0].val);
                  const formatted = study.statSuffix === '%'
                    ? `${study.statPrefix}${current}${study.statSuffix}`
                    : `${study.statPrefix}${current.toLocaleString('nl-NL')}${study.statSuffix}`;
                  el.textContent = formatted;
                },
              }
            );
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="resultaten"
      className="relative min-h-screen overflow-hidden z-10"
    >
      <div ref={trackRef} className="h-screen flex flex-col justify-center">
        {/* Header */}
        <div className="container mb-10">
          <div className="flex items-end justify-between">
            <div>
              <span className="block text-[length:var(--text-xs)] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-[var(--space-element)]">
                Resultaten
              </span>
              <h2 className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-3xl)] leading-[1.1] max-w-[24ch]">
                {'Bewezen resultaten in Noord-Brabant'.split(' ').map((word, i) => (
                  <span key={i} className="inline-block mr-[0.25em]">{word}</span>
                ))}
              </h2>
            </div>

            {/* Counter */}
            <div className="hidden md:block text-[length:var(--text-sm)] text-[var(--color-text-muted)] tabular-nums">
              <span ref={counterRef} className="text-[var(--color-text)] font-medium">
                {String(currentPanel).padStart(2, '0')}
              </span>
              {' / '}
              <span>{String(caseStudies.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Horizontal scroll panels */}
        <div
          ref={panelsRef}
          className="flex gap-8 pl-[var(--container-padding)]"
          style={{ willChange: 'transform' }}
        >
          {caseStudies.map((study, i) => (
            <div
              key={i}
              className="case-panel shrink-0 w-[80vw] md:w-[55vw] lg:w-[45vw] bg-[var(--color-bg-elevated)] rounded-2xl overflow-hidden shadow-lg shadow-black/5 flex flex-col"
            >
              {/* Image — top 60% */}
              <div
                ref={(el) => { imageRefs.current[i] = el; }}
                className="relative w-full aspect-[16/10] overflow-hidden"
              >
                <Image
                  src={study.image}
                  alt={study.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 45vw"
                />
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col gap-4 flex-1">
                {/* Stat */}
                <div>
                  <span
                    ref={(el) => { statRefs.current[i] = el; }}
                    className="block font-[family-name:var(--font-fraunces)] text-[length:var(--text-4xl)] text-[var(--color-accent)] leading-none"
                  >
                    {study.stat}
                  </span>
                  <span className="block text-[length:var(--text-sm)] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
                    {study.statLabel}
                  </span>
                </div>

                {/* Title + description */}
                <h3 className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-xl)] leading-tight">
                  {study.title.split(' ').map((word, j) => (
                    <span key={j} className="inline-block mr-[0.25em]">{word}</span>
                  ))}
                </h3>
                <p className="text-[length:var(--text-base)] text-[var(--color-text-muted)] leading-relaxed">
                  {study.description}
                </p>

                {/* Location tag */}
                <span className="inline-flex items-center gap-2 text-[length:var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-wider mt-auto pt-4">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1C4.24 1 2 3.24 2 6C2 9.75 7 13 7 13C7 13 12 9.75 12 6C12 3.24 9.76 1 7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  {study.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
