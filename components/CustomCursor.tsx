'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    if (typeof window === 'undefined') return;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) {
      dot.style.display = 'none';
      ring.style.display = 'none';
      return;
    }

    const ctx = gsap.context(() => {
      const onMouseMove = (e: MouseEvent) => {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.to(ring, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: 'power2.out',
        });
      };

      const onMouseEnterInteractive = () => {
        gsap.to(dot, { scale: 1.5, duration: 0.2 });
        gsap.to(ring, { scale: 1.5, duration: 0.2 });
      };

      const onMouseLeaveInteractive = () => {
        gsap.to(dot, { scale: 1, duration: 0.2 });
        gsap.to(ring, { scale: 1, duration: 0.2 });
      };

      window.addEventListener('mousemove', onMouseMove);

      const interactiveElements = document.querySelectorAll('a, button');
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        interactiveElements.forEach((el) => {
          el.removeEventListener('mouseenter', onMouseEnterInteractive);
          el.removeEventListener('mouseleave', onMouseLeaveInteractive);
        });
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block"
        style={{ backgroundColor: 'var(--color-accent)', willChange: 'transform' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block"
        style={{ border: '1px solid var(--color-accent)', willChange: 'transform' }}
      />
    </>
  );
}
