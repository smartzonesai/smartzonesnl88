'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function Testimonial() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (quoteRef.current) {
        gsap.set(quoteRef.current, { opacity: 0, filter: 'blur(8px)', y: 30 });
        ScrollTrigger.create({
          trigger: quoteRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(quoteRef.current, {
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              duration: 1,
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
      <div className="container flex justify-center">
        <blockquote
          ref={quoteRef}
          className="relative max-w-4xl text-center"
        >
          {/* Large quotation mark */}
          <span
            className="absolute -top-16 left-1/2 -translate-x-1/2 font-[family-name:var(--font-fraunces)] text-[10rem] leading-none text-[var(--color-accent)] opacity-30 select-none pointer-events-none"
            aria-hidden="true"
          >
            &ldquo;
          </span>

          {/* Quote text */}
          <p className="relative font-[family-name:var(--font-fraunces)] text-[length:var(--text-2xl)] leading-[1.4] mb-8 z-10">
            {'Smart Zones heeft onze omzet met 18% verhoogd door alleen de indeling te veranderen. Geen verbouwing, geen nieuw assortiment \u2014 puur slimmer inrichten.'.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-[0.25em]">{word}</span>
            ))}
          </p>

          {/* Attribution */}
          <footer className="text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
            <cite className="not-italic">
              Marieke van den Berg, eigenaar Modehuis Breda
            </cite>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
