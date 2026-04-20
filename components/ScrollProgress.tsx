'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left"
      style={{ backgroundColor: 'var(--color-accent)', transform: 'scaleX(0)' }}
    />
  );
}
