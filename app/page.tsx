import FloorPlanExperience from '@/components/sections/FloorPlanExperience';
import About from '@/components/sections/About';
import AI from '@/components/sections/AI';
import CTA from '@/components/sections/CTA';
import Preloader from '@/components/Preloader';
import CustomCursor from '@/components/CustomCursor';
import ScrollProgress from '@/components/ScrollProgress';
import SmoothScroller from '@/components/SmoothScroller';

export default function Home() {
  return (
    <SmoothScroller>
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <main id="main">

        {/* HERO — plattegrond + headline + zone stepper */}
        <FloorPlanExperience />

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(232,122,46,0.18) 30%, rgba(232,122,46,0.18) 70%, transparent)', zIndex: 5 }} aria-hidden="true"/>

        {/* HOE HET WERKT — 3 stappen */}
        <About />

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(74,158,229,0.12) 30%, rgba(74,158,229,0.12) 70%, transparent)', zIndex: 5 }} aria-hidden="true"/>

        {/* WAAROM HET WERKT — before/after + features + quote */}
        <AI />

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(232,122,46,0.15) 30%, rgba(232,122,46,0.15) 70%, transparent)', zIndex: 5 }} aria-hidden="true"/>

        {/* CTA — social proof + pricing + checklist */}
        <CTA />

      </main>
    </SmoothScroller>
  );
}
