'use client';

import { useRef, useEffect, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const navigatieLinks = [
  { label: 'Platform', href: '#aanpak' },
  { label: 'Technologie', href: '#ai' },
  { label: 'Hoe het werkt', href: '#over-ons' },
  { label: 'Prijzen', href: '#contact' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contactLinksRef = useRef<HTMLDivElement>(null);
  const linkColumnsRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Headline blur-in */
      if (headlineRef.current) {
        gsap.set(headlineRef.current, { opacity: 0, filter: 'blur(6px)', y: 30 });
        ScrollTrigger.create({
          trigger: headlineRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(headlineRef.current, {
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
            });
          },
        });
      }

      /* Contact links stagger fade in */
      if (contactLinksRef.current) {
        const links = contactLinksRef.current.querySelectorAll('.footer-contact-link');
        gsap.set(links, { opacity: 0, y: 15 });
        ScrollTrigger.create({
          trigger: contactLinksRef.current,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(links, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power2.out',
            });
          },
        });
      }

      /* Link columns stagger in from bottom */
      if (linkColumnsRef.current) {
        const items = linkColumnsRef.current.querySelectorAll('.footer-link-item');
        gsap.set(items, { opacity: 0, y: 20 });
        ScrollTrigger.create({
          trigger: linkColumnsRef.current,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
            });
          },
        });
      }

      /* Bottom bar fade in */
      if (bottomBarRef.current) {
        gsap.set(bottomBarRef.current, { opacity: 0 });
        ScrollTrigger.create({
          trigger: bottomBarRef.current,
          start: 'top 95%',
          once: true,
          onEnter: () => {
            gsap.to(bottomBarRef.current, {
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
            });
          },
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        backgroundColor: '#111110',
        borderTop: '1px solid rgba(232, 228, 220, 0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle ambient glow at top-center */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '30%',
          width: '40%',
          height: '200px',
          background: 'radial-gradient(ellipse at center, rgba(232, 122, 46, 0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* CTA headline */}
      <div className="container pt-24 pb-16 text-center" style={{ position: 'relative', zIndex: 1 }}>
        <h2
          ref={headlineRef}
          className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          style={{ color: '#E8E4DC' }}
        >
          Start uw winkelanalyse vandaag
        </h2>

        <div ref={contactLinksRef} className="mt-10 flex flex-col items-center gap-4 text-base">
          <a
            href="mailto:info@smartzones.nl"
            className="footer-contact-link group relative transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: '#E87A2E' }}
          >
            info@smartzones.nl
            <span
              className="absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{ backgroundColor: '#E87A2E' }}
            />
          </a>
          <a
            href="tel:+31761234567"
            className="footer-contact-link transition-colors duration-300 hover:text-[#E87A2E] focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'rgba(232, 228, 220, 0.6)' }}
          >
            +31 76 123 4567
          </a>
        </div>
      </div>

      {/* Link columns */}
      <div ref={linkColumnsRef} className="container grid grid-cols-2 gap-8 pb-16 md:grid-cols-4" style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigatie */}
        <div>
          <h3
            className="footer-link-item mb-5 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'rgba(232, 228, 220, 0.3)' }}
          >
            Navigatie
          </h3>
          <ul className="space-y-3">
            {navigatieLinks.map((link) => (
              <li key={link.href} className="footer-link-item">
                <a
                  href={link.href}
                  className="text-sm transition-colors duration-300 hover:text-[#E87A2E] focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: 'rgba(232, 228, 220, 0.5)' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        ref={bottomBarRef}
        className="border-t"
        style={{ borderColor: 'rgba(232, 228, 220, 0.08)', position: 'relative', zIndex: 1 }}
      >
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p
            className="text-xs"
            style={{ color: 'rgba(232, 228, 220, 0.3)' }}
          >
            &copy; 2026 SMARTZONES. Alle rechten voorbehouden.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-xs transition-opacity duration-300 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: 'rgba(232, 228, 220, 0.3)' }}
            >
              Privacybeleid
            </a>
            <a
              href="/voorwaarden"
              className="text-xs transition-opacity duration-300 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: 'rgba(232, 228, 220, 0.3)' }}
            >
              Algemene voorwaarden
            </a>
            <a
              href="/cookie-policy"
              className="text-xs transition-opacity duration-300 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: 'rgba(232, 228, 220, 0.3)' }}
            >
              Cookie Policy
            </a>
            <button
              onClick={scrollToTop}
              aria-label="Terug naar boven"
              className="flex h-10 w-10 items-center justify-center rounded-full px-2 py-2 transition-all duration-300 hover:scale-110 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                border: '1px solid rgba(232, 228, 220, 0.12)',
                color: 'rgba(232, 228, 220, 0.5)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = '#E87A2E';
                el.style.backgroundColor = '#E87A2E';
                el.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(232, 228, 220, 0.12)';
                el.style.backgroundColor = 'transparent';
                el.style.color = 'rgba(232, 228, 220, 0.5)';
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
