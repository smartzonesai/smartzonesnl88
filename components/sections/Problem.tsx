'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const problems = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
    title: 'Dode zones',
    description: '35% van uw vloeroppervlak wordt niet bezocht',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 26L12 16L18 20L26 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 6H26V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Verkeerde routing',
    description: 'Klanten missen de helft van uw aanbod',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="17" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Lage conversie',
    description: 'Bezoekers die kijken maar niet kopen',
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLDivElement>(null);
  const problemsRef = useRef<HTMLDivElement>(null);
  const agitationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image clip-path wipe from bottom
      if (imageWrapRef.current) {
        gsap.set(imageWrapRef.current, {
          clipPath: 'inset(100% 0 0 0)',
        });
        ScrollTrigger.create({
          trigger: imageWrapRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(imageWrapRef.current, {
              clipPath: 'inset(0% 0 0 0)',
              duration: 1,
              ease: 'power2.out',
            });
          },
        });
      }

      // Text fades over image
      if (overlayTextRef.current) {
        gsap.set(overlayTextRef.current, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: imageWrapRef.current,
          start: 'top 60%',
          once: true,
          onEnter: () => {
            gsap.to(overlayTextRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
            });
          },
        });
      }

      // Problems stagger in
      const problemCards = problemsRef.current?.querySelectorAll('.problem-item');
      if (problemCards) {
        gsap.set(problemCards, { opacity: 0, y: 20 });
        ScrollTrigger.create({
          trigger: problemsRef.current,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            gsap.to(problemCards, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
            });
          },
        });
      }

      // Image parallax
      if (imageWrapRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            const img = imageWrapRef.current?.querySelector('.parallax-img');
            if (img) {
              gsap.set(img, { y: self.progress * 60 });
            }
          },
        });
      }

      // Agitation text fade in
      if (agitationRef.current) {
        gsap.set(agitationRef.current, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: agitationRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(agitationRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
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
      className="relative overflow-hidden z-10"
    >
      {/* Full-bleed image with overlay */}
      <div ref={imageWrapRef} className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <div className="parallax-img relative w-full h-[120%] -top-[10%]">
          <Image
            src="/images/store-analysis.png"
            alt="Winkelanalyse door Smart Zones"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[var(--color-text)]/60" />

        {/* Overlay content */}
        <div ref={overlayTextRef} className="absolute inset-0 flex flex-col justify-center z-10">
          <div className="container">
            <h2 className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-3xl)] leading-[1.1] text-white max-w-[24ch] mb-10">
              {'Weet u welke plekken in uw winkel geld kosten?'.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-[0.25em]">{word}</span>
              ))}
            </h2>

            {/* Three problems horizontal */}
            <div ref={problemsRef} className="flex flex-col md:flex-row gap-8 md:gap-12">
              {problems.map((problem, i) => (
                <div key={i} className="problem-item flex items-start gap-4 text-white/90">
                  <div className="shrink-0 text-[var(--color-accent)]">
                    {problem.icon}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-lg)] leading-tight mb-1">
                      {problem.title}
                    </h3>
                    <p className="text-[length:var(--text-sm)] text-white/70 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agitation text below */}
      <div ref={agitationRef} className="py-[var(--space-section)] bg-[var(--color-bg)]">
        <div className="container">
          <p className="font-[family-name:var(--font-fraunces)] text-[length:var(--text-2xl)] leading-[1.3] max-w-[40ch]">
            {'De meeste winkeliers verliezen 15-30% omzet aan een slechte indeling. Zonder het te weten.'.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-[0.25em]">{word}</span>
            ))}
          </p>
          <p className="text-[length:var(--text-lg)] text-[var(--color-accent)] mt-4 font-medium">
            Uw concurrent heeft het al aangepakt.
          </p>
        </div>
      </div>
    </section>
  );
}
