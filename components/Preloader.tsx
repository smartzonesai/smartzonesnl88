'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    const text = textRef.current;
    if (!container || !svg || !text) return;

    const paths = svg.querySelectorAll('path, line, rect');

    const ctx = gsap.context(() => {
      // Set initial state for SVG paths
      paths.forEach((path) => {
        const length = (path as SVGGeometryElement).getTotalLength?.() || 400;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      gsap.set(text, { opacity: 0, y: 10 });

      const counter = { value: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(container, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.8,
            ease: 'power2.inOut',
          });
        },
      });

      // Animate counter and SVG drawing together
      tl.to(counter, {
        value: 100,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          setCount(Math.round(counter.value));
        },
      });

      // Draw SVG paths
      tl.to(
        paths,
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          stagger: 0.15,
        },
        0
      );

      // Fade in text after drawing starts
      tl.to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        1.2
      );
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
      style={{
        clipPath: 'inset(0 0 0% 0)',
        backgroundColor: '#111110',
      }}
    >
      {/* Floor plan SVG outline */}
      <svg
        ref={svgRef}
        viewBox="0 0 300 200"
        fill="none"
        className="w-64 md:w-80"
        aria-hidden="true"
      >
        {/* Outer rectangle */}
        <rect
          x="10"
          y="10"
          width="280"
          height="180"
          stroke="#3A3632"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Inner division lines */}
        <line x1="110" y1="10" x2="110" y2="130" stroke="#3A3632" strokeWidth="1" />
        <line x1="200" y1="70" x2="200" y2="190" stroke="#3A3632" strokeWidth="1" />
        <line x1="110" y1="130" x2="200" y2="130" stroke="#3A3632" strokeWidth="1" />
        <line x1="10" y1="70" x2="110" y2="70" stroke="#3A3632" strokeWidth="1" />
        {/* Door arcs */}
        <path d="M 140 190 A 30 30 0 0 1 170 190" stroke="#E87A2E" strokeWidth="1" />
        <path d="M 110 40 A 20 20 0 0 1 130 40" stroke="#E87A2E" strokeWidth="1" />
      </svg>

      {/* Welcome text */}
      <p
        ref={textRef}
        className="mt-8 font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight"
        style={{ color: 'rgba(232, 228, 220, 0.4)' }}
      >
        Welkom in uw winkel
      </p>

      {/* Counter */}
      <span
        className="mt-4 font-mono text-xs tabular-nums tracking-widest"
        style={{ color: '#E8E4DC' }}
      >
        {String(count).padStart(3, '0')}
        <span style={{ color: '#E87A2E' }}>%</span>
      </span>
    </div>
  );
}
