'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface SmoothScrollerProps {
  children: ReactNode;
}

export default function SmoothScroller({ children }: SmoothScrollerProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    const ctx = gsap.context(() => {
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
