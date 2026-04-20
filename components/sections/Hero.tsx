'use client';

import { useRef, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Headline words slide-up staggered
      const words = headlineRef.current?.querySelectorAll('.word-inner');
      if (words) {
        gsap.set(words, { yPercent: 110 });
        tl.to(words, {
          yPercent: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
        }, 0.3);
      }

      // Subtitle fades up
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
        tl.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
        }, 0.8);
      }

      // CTA row enters
      if (ctaRowRef.current) {
        gsap.set(ctaRowRef.current, { opacity: 0, y: 20 });
        tl.to(ctaRowRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.4)',
        }, 1.1);
      }

      // Proof nugget
      if (proofRef.current) {
        gsap.set(proofRef.current, { opacity: 0 });
        tl.to(proofRef.current, {
          opacity: 1,
          duration: 0.5,
        }, 1.4);
      }

      // Scroll indicator
      if (scrollIndicatorRef.current) {
        gsap.set(scrollIndicatorRef.current, { opacity: 0 });
        tl.to(scrollIndicatorRef.current, {
          opacity: 0.6,
          duration: 0.5,
        }, 1.6);

        const scrollLine = scrollIndicatorRef.current.querySelector('.scroll-line');
        if (scrollLine) {
          gsap.to(scrollLine, {
            scaleY: 1,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
          });
        }
      }

      // Parallax on scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (imageRef.current) {
            gsap.set(imageRef.current, { y: p * 150 });
          }
          if (contentRef.current) {
            gsap.set(contentRef.current, {
              opacity: 1 - p * 1.8,
              y: p * 80,
            });
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden z-10"
    >
      {/* Full-bleed background image */}
      <div ref={imageRef} className="absolute inset-0 w-full h-[130%] -top-[15%]">
        <Image
          src="/images/hero-floorplan.png"
          alt="Smart Zones winkeloptimalisatie vloerplan van bovenaf"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Gradient overlays for text readability — left-side bias for centered content */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)]/70 via-[var(--color-bg)]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/60 via-transparent to-[var(--color-bg)]/30" />

      {/* Content — vertically centered */}
      <div
        ref={contentRef}
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center py-32 md:py-40"
      >
        <div className="container max-w-[1400px] mx-auto px-6 md:px-10">
          {/* Label */}
          <p className="text-[length:var(--text-xs)] uppercase tracking-[0.2em] text-[var(--color-accent)] font-medium mb-6 md:mb-8">
            Winkeloptimalisatie · Breda · Eindhoven · Tilburg
          </p>

          {/* Massive headline — each word on its own line for maximum impact */}
          <h1
            ref={headlineRef}
            className="font-[family-name:var(--font-fraunces)] leading-[0.95] tracking-[-0.02em] mb-8 md:mb-10"
          >
            {['Elke', 'vierkante', 'meter telt'].map((word, i) => (
              <Fragment key={i}>
                <span className="block overflow-hidden">
                  <span
                    className="word-inner block"
                    style={{
                      fontSize: i === 2
                        ? 'clamp(3rem, 10vw, 7.5rem)'
                        : i === 1
                        ? 'clamp(3rem, 10vw, 7.5rem)'
                        : 'clamp(3rem, 10vw, 7.5rem)',
                    }}
                  >
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-[length:var(--text-lg)] md:text-[length:var(--text-xl)] text-[var(--color-text)]/80 leading-relaxed max-w-[52ch] mb-10 md:mb-12"
          >
            Gemiddeld 23% meer omzet na herinrichting. Wij analyseren hoe klanten
            door uw winkel bewegen — en maken van elke zone een verkoopkans.
          </p>

          {/* CTAs */}
          <div ref={ctaRowRef} className="flex flex-wrap items-center gap-5 md:gap-6 mb-10">
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-3 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
              style={{
                padding: '1rem 2.5rem',
                backgroundColor: '#E87A2E',
                color: '#fff',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: 600,
              }}
            >
              <span
                className="absolute inset-0 rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ backgroundColor: '#D06820' }}
              />
              <span className="relative z-10">Plan een gratis winkelaudit</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>

            <a
              href="#resultaten"
              className="group inline-flex items-center gap-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:border-[#E87A2E] hover:text-[#E87A2E] focus-visible:outline-2 focus-visible:outline-[#E87A2E] focus-visible:outline-offset-2"
              style={{
                padding: '1rem 1.75rem',
                border: '1.5px solid rgba(44, 33, 20, 0.25)',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              <span>Bekijk resultaten</span>
              <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </a>
          </div>

          {/* Proof nugget */}
          <div
            ref={proofRef}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[length:var(--text-xs)] text-[var(--color-text)]/50 tracking-wide"
          >
            <span>50+ winkels geholpen</span>
            <span className="text-[var(--color-accent)]/40">·</span>
            <span>15 jaar ervaring</span>
            <span className="text-[var(--color-accent)]/40">·</span>
            <span>Noord-Brabant</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Scroll</span>
        <div className="scroll-line w-px h-10 bg-[var(--color-text-muted)]/50 origin-top scale-y-0" />
      </div>
    </section>
  );
}
