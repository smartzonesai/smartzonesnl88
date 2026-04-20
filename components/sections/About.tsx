'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const STEPS = [
  { num: 1, color: '#E87A2E', title: 'Je filmt je winkel', body: 'Loop 5 minuten door je winkel met je telefoon. Geen speciale camera nodig. Geen afspraak. Upload daarna de video.', tag: 'Duurt 5 minuten' },
  { num: 2, color: '#4A9EE5', title: 'Wij analyseren alles voor je', body: 'Onze AI bekijkt je video en ziet precies wat er beter kan. Waar lopen klanten? Welke producten worden overgeslagen? Waar verlies je omzet?', tag: 'Binnen 1 uur klaar' },
  { num: 3, color: '#34D399', title: 'Je voert het plan gewoon uit', body: 'Niet vaag advies, maar: "Zet schap B 2 meter naar links, product X op ooghoogte." Gewoon uitvoeren — dit weekend al.', tag: 'Zelf uitvoeren' },
];

const STATS = [
  { value: '€199', label: 'eenmalig', color: '#E87A2E' },
  { value: '<1u', label: 'resultaat', color: '#F5A623' },
  { value: '500+', label: 'winkeliers', color: '#4A9EE5' },
];

const card: React.CSSProperties = {
  background: 'rgba(26,25,23,0.6)',
  border: '1px solid rgba(232,228,220,0.07)',
  borderRadius: '12px',
  padding: 'clamp(1.25rem,2.5vw,1.75rem)',
};

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headRef.current) {
        gsap.set(headRef.current, { opacity: 0, y: 28, filter: 'blur(6px)' });
        ScrollTrigger.create({ trigger: headRef.current, start: 'top 85%', once: true,
          onEnter: () => gsap.to(headRef.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }) });
      }
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.step-card');
        gsap.set(cards, { opacity: 0, x: -30 });
        ScrollTrigger.create({ trigger: cardsRef.current, start: 'top 82%', once: true,
          onEnter: () => gsap.to(cards, { opacity: 1, x: 0, duration: 0.7, stagger: 0.14, ease: 'power2.out' }) });
      }
      if (statsRef.current) {
        const items = statsRef.current.querySelectorAll('.stat-item');
        gsap.set(items, { opacity: 0, y: 30 });
        ScrollTrigger.create({ trigger: statsRef.current, start: 'top 88%', once: true,
          onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }) });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="hoe-het-werkt" style={{ background: '#111110', padding: 'clamp(4rem,10vw,7rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,6vw,4rem)' }}>
          <span className="zone-label" style={{ display: 'block', marginBottom: '1rem' }}>Hoe het werkt</span>
          <h2 ref={headRef} style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 800, color: '#E8E4DC', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
            Van video naar verbeterplan in 3 stappen
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem,1.6vw,1rem)', color: 'rgba(232,228,220,0.45)', maxWidth: '44ch', margin: '0 auto', lineHeight: 1.7 }}>
            Geen consultants. Geen afspraken. Gewoon je telefoon en onze AI.
          </p>
        </div>

        {/* Stap kaarten */}
        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
          {STEPS.map((s) => (
            <div key={s.num} className="step-card" style={{ ...card, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(to right, ${s.color}, transparent)`, opacity: 0.6 }}/>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '3.5rem', fontWeight: 800, color: s.color, opacity: 0.04, lineHeight: 1, userSelect: 'none' }}>
                {String(s.num).padStart(2,'0')}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${s.color}14`, border: `1.5px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: s.color, marginBottom: '1rem' }}>
                {s.num}
              </div>
              <h3 style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.6rem' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(232,228,220,0.5)', lineHeight: 1.65, marginBottom: '1rem' }}>
                {s.body}
              </p>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: `${s.color}12`, color: s.color }}>
                {s.tag}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', maxWidth: '520px', margin: '0 auto' }}>
          {STATS.map((st) => (
            <div key={st.label} className="stat-item" style={{ ...card, borderTop: `2px solid ${st.color}`, textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-syne),system-ui,sans-serif', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: st.color, lineHeight: 1, marginBottom: '0.3rem' }}>
                {st.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(232,228,220,0.35)' }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
