'use client';

import { useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { gsap } from '@/lib/gsap';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const iconRef = useRef<HTMLSpanElement>(null);

  const handleClick = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: '+=360',
        duration: 0.5,
        ease: 'power2.out',
      });
    }
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={
        theme === 'light'
          ? 'Schakel naar donkere modus'
          : 'Schakel naar lichte modus'
      }
      className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
    >
      <span ref={iconRef} className="inline-block text-xl leading-none">
        {theme === 'light' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
    </button>
  );
}
