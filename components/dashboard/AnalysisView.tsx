'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import Link from 'next/link';
import type { AnalysisRow, AnalysisResult } from '@/lib/supabase';
import { exportCSV, exportPDF } from '@/lib/export';

/* ================================================================ */
/*  Types                                                            */
/* ================================================================ */

interface Step {
  text: string;
  description: string;
  location: string;
  impact: string;
  detailed_instructions: string;
  visual_before_url: string;
  visual_after_url: string;
  done: boolean;
}

interface Phase {
  title: string;
  color: string;
  description: string;
  steps: Step[];
  open: boolean;
}

const TABS = ['Overzicht', 'Vloerplan', 'Implementatieplan', 'Heatmap', 'Gedragsanalyse', 'Neuromarketing'] as const;

/* ================================================================ */
/*  Dynamic Floor Plan                                               */
/* ================================================================ */

function DynamicFloorPlan({
  floorPlan,
  heatmapData,
  showHeatmap = false,
}: {
  floorPlan: AnalysisResult['floor_plan'] | null;
  heatmapData?: AnalysisResult['heatmap_data'];
  showHeatmap?: boolean;
}) {
  if (!floorPlan || !floorPlan.svg_elements?.length) {
    return <FallbackFloorPlan showHeatmap={showHeatmap} />;
  }

  const w = floorPlan.store_width || 1200;
  const h = floorPlan.store_height || 900;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} fill="none" style={{ width: '100%', height: 'auto', maxHeight: '60vh' }}>
      {/* Grid */}
      {Array.from({ length: Math.floor(w / 50) }, (_, i) => (
        <line key={`gv${i}`} x1={i * 50} y1={0} x2={i * 50} y2={h} stroke="rgba(232,228,220,0.035)" strokeWidth="0.3" />
      ))}
      {Array.from({ length: Math.floor(h / 50) }, (_, i) => (
        <line key={`gh${i}`} x1={0} y1={i * 50} x2={w} y2={i * 50} stroke="rgba(232,228,220,0.035)" strokeWidth="0.3" />
      ))}

      {/* Floor background */}
      <rect x={2} y={2} width={w - 4} height={h - 4} fill="#1A1917" rx={4} />

      {/* Elements from AI */}
      {floorPlan.svg_elements.map((el, i) => (
        <g key={i}>
          <rect
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            fill={el.color || '#1E1C18'}
            fillOpacity={0.15}
            stroke={el.color || '#3A3632'}
            strokeWidth="1.5"
            rx={4}
          />
          <text
            x={el.x + el.width / 2}
            y={el.y + el.height / 2 + 4}
            textAnchor="middle"
            fill="rgba(232,228,220,0.4)"
            fontSize="11"
            fontWeight="600"
          >
            {el.label}
          </text>
        </g>
      ))}

      {/* Walking route */}
      {floorPlan.walking_route?.length > 1 && (
        <path
          d={`M${floorPlan.walking_route.map((p) => `${p.x} ${p.y}`).join(' L')}`}
          fill="none"
          stroke="#E87A2E"
          strokeWidth="2.5"
          strokeDasharray="8 6"
          opacity="0.5"
        />
      )}

      {/* Heatmap overlay */}
      {showHeatmap && heatmapData && (
        <g opacity="0.6">
          {heatmapData.map((zone, i) => {
            const cx = (zone.x / 100) * w;
            const cy = (zone.y / 100) * h;
            const rx = ((zone.width || 15) / 100) * w;
            const ry = ((zone.height || 15) / 100) * h;
            const color = zone.intensity > 0.6 ? '#E53E3E' : zone.intensity > 0.3 ? '#DD6B20' : '#3182CE';

            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill={color}
                fillOpacity={zone.intensity * 0.5}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}

/* Fallback floor plan for when no AI data available */
function FallbackFloorPlan({ showHeatmap = false }: { showHeatmap?: boolean }) {
  return (
    <svg viewBox="0 0 1200 900" fill="none" style={{ width: '100%', height: 'auto', maxHeight: '60vh' }}>
      <defs>
        <radialGradient id="dh1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#E53E3E" stopOpacity="0.6" /><stop offset="100%" stopColor="#E53E3E" stopOpacity="0" /></radialGradient>
        <radialGradient id="dh2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#DD6B20" stopOpacity="0.5" /><stop offset="100%" stopColor="#DD6B20" stopOpacity="0" /></radialGradient>
        <radialGradient id="dc1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3182CE" stopOpacity="0.4" /><stop offset="100%" stopColor="#3182CE" stopOpacity="0" /></radialGradient>
      </defs>
      {Array.from({ length: 24 }, (_, i) => (<line key={`gv${i}`} x1={50+i*50} y1={50} x2={50+i*50} y2={850} stroke="rgba(232,228,220,0.035)" strokeWidth="0.3" />))}
      {Array.from({ length: 17 }, (_, i) => (<line key={`gh${i}`} x1={50} y1={50+i*50} x2={1150} y2={50+i*50} stroke="rgba(232,228,220,0.035)" strokeWidth="0.3" />))}
      <rect x={53} y={53} width={1094} height={794} fill="#1A1917" rx={2} />
      <rect x={480} y={755} width={240} height={100} fill="#E87A2E" opacity={0.06} rx={4} />
      <rect x={80} y={130} width={215} height={575} fill="#34A853" opacity={0.05} rx={4} />
      <rect x={900} y={130} width={215} height={575} fill="#34A853" opacity={0.05} rx={4} />
      <line x1={50} y1={50} x2={1150} y2={50} stroke="#4A453C" strokeWidth="2.5" />
      <line x1={50} y1={50} x2={50} y2={850} stroke="#4A453C" strokeWidth="2.5" />
      <line x1={1150} y1={50} x2={1150} y2={850} stroke="#4A453C" strokeWidth="2.5" />
      <line x1={50} y1={850} x2={500} y2={850} stroke="#4A453C" strokeWidth="2.5" />
      <line x1={700} y1={850} x2={1150} y2={850} stroke="#4A453C" strokeWidth="2.5" />
      <rect x={500} y={780} width={200} height={70} fill="#1E1C18" stroke="#3A3632" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
      {[0,1,2,3].map(i => <rect key={`sl${i}`} x={100} y={150+i*35} width={180} height={25} fill="#1E1C18" stroke="#3A3632" strokeWidth="1" rx="2" />)}
      {[0,1,2,3].map(i => <rect key={`sr${i}`} x={920} y={150+i*35} width={180} height={25} fill="#1E1C18" stroke="#3A3632" strokeWidth="1" rx="2" />)}
      <path d="M600 860 L600 700 L600 500 L350 500 L350 300 L350 180 L600 180 L850 180 L850 350 L850 500 L600 500" fill="none" stroke="#E87A2E" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
      {showHeatmap && (
        <g opacity="0.6">
          <ellipse cx={600} cy={800} rx={160} ry={100} fill="url(#dh1)" />
          <circle cx={450} cy={400} r={100} fill="url(#dh2)" />
          <ellipse cx={140} cy={700} rx={110} ry={120} fill="url(#dc1)" />
        </g>
      )}
      <text x={600} y={830} textAnchor="middle" fill="rgba(232,228,220,0.3)" fontSize="14" fontWeight="600" letterSpacing="0.12em">INGANG</text>
      <text x={600} y={75} textAnchor="middle" fill="rgba(232,228,220,0.3)" fontSize="14" fontWeight="600" letterSpacing="0.12em">KASSA</text>
    </svg>
  );
}

/* ================================================================ */
/*  Visual Step Detail                                               */
/* ================================================================ */

function StepVisualDetail({ step, phaseColor }: { step: Step; phaseColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const [imageView, setImageView] = useState<'before' | 'after'>('before');

  if (!step.detailed_instructions && !step.visual_before_url) return null;

  return (
    <div style={{
      marginTop: '0.75rem',
      marginLeft: '2.75rem',
      background: 'rgba(26,25,23,0.6)',
      border: '1px solid rgba(232,228,220,0.06)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '0.6rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', color: phaseColor,
          fontSize: '0.8rem', fontWeight: 600,
        }}
      >
        <span>Bekijk details & visuele gids</span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', fontSize: '0.7rem' }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 1rem 1rem' }}>
          {/* Before/After images */}
          {(step.visual_before_url || step.visual_after_url) && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {step.visual_before_url && (
                  <button
                    onClick={() => setImageView('before')}
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                      background: imageView === 'before' ? phaseColor : 'rgba(232,228,220,0.06)',
                      color: imageView === 'before' ? '#fff' : 'rgba(232,228,220,0.5)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    Huidige situatie
                  </button>
                )}
                {step.visual_after_url && (
                  <button
                    onClick={() => setImageView('after')}
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                      background: imageView === 'after' ? '#34A853' : 'rgba(232,228,220,0.06)',
                      color: imageView === 'after' ? '#fff' : 'rgba(232,228,220,0.5)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    Aanbeveling
                  </button>
                )}
              </div>
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(232,228,220,0.08)',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageView === 'before' ? step.visual_before_url : step.visual_after_url}
                  alt={`${imageView === 'before' ? 'Huidige situatie' : 'Aanbeveling'}: ${step.text}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Location & Impact */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {step.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)' }}>
                <span style={{ fontSize: '1rem' }}>📍</span> {step.location}
              </div>
            )}
            {step.impact && (
              <div style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#34A853',
                background: 'rgba(52,168,83,0.1)', padding: '0.25rem 0.6rem', borderRadius: '4px',
              }}>
                {step.impact}
              </div>
            )}
          </div>

          {/* Detailed instructions */}
          {step.detailed_instructions && (
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(232,228,220,0.65)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              borderTop: '1px solid rgba(232,228,220,0.06)',
              paddingTop: '0.75rem',
            }}>
              {step.detailed_instructions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  Main Component                                                   */
/* ================================================================ */

interface AnalysisViewProps {
  /** When provided, the component renders in demo/standalone mode — no API calls */
  demoAnalysis?: AnalysisRow;
  /** Override the back-link destination (defaults to /dashboard) */
  backHref?: string;
  /** Override the back-link label */
  backLabel?: string;
}

export default function AnalysisView({ demoAnalysis, backHref, backLabel }: AnalysisViewProps = {}) {
  const params = useParams();
  const analysisId = demoAnalysis?.id ?? (params?.id as string);

  const [loading, setLoading] = useState(!demoAnalysis);
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(demoAnalysis ?? null);
  const [result, setResult] = useState<AnalysisResult | null>(demoAnalysis?.result_json ?? null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Overzicht');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const exportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Close export dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Initialize phases from demo data on mount */
  useEffect(() => {
    if (demoAnalysis?.result_json) {
      initPhases(demoAnalysis.result_json);
    }
  }, [demoAnalysis]);

  /* Fetch analysis data (skipped in demo mode) */
  useEffect(() => {
    if (demoAnalysis) return;
    if (!analysisId) return;

    let pollInterval: ReturnType<typeof setInterval>;

    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/analysis/${analysisId}`);
        if (!res.ok) throw new Error('Not found');
        const data: AnalysisRow = await res.json();
        setAnalysis(data);

        if (data.result_json) {
          setResult(data.result_json);
          // Initialize phases from result
          initPhases(data.result_json);
        }

        // Stop polling when complete or failed
        if (data.status === 'complete' || data.status === 'failed') {
          clearInterval(pollInterval);
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    }

    fetchAnalysis();

    // Poll every 5 seconds while processing
    pollInterval = setInterval(fetchAnalysis, 5000);

    return () => clearInterval(pollInterval);
  }, [analysisId, demoAnalysis]);

  function initPhases(r: AnalysisResult) {
    // Check localStorage for saved progress (skip in demo mode)
    if (!demoAnalysis) {
      const savedKey = `sz-steps-${analysisId}`;
      const saved = typeof window !== 'undefined' ? localStorage.getItem(savedKey) : null;

      if (saved) {
        try {
          setPhases(JSON.parse(saved));
          return;
        } catch { /* ignore parse errors */ }
      }
    }

    // Build phases from AI result
    const newPhases: Phase[] = (r.implementation_plan?.phases || []).map((phase, i) => ({
      title: phase.title,
      color: phase.color,
      description: phase.description || '',
      open: i === 0,
      steps: (phase.steps || []).map((step) => ({
        text: step.title,
        description: step.description,
        location: step.location,
        impact: step.impact,
        detailed_instructions: step.detailed_instructions,
        visual_before_url: step.visual_before_url,
        visual_after_url: step.visual_after_url,
        done: false,
      })),
    }));

    setPhases(newPhases);
  }

  /* Persist step progress (skip in demo mode) */
  useEffect(() => {
    if (!demoAnalysis && phases.length > 0 && analysisId) {
      localStorage.setItem(`sz-steps-${analysisId}`, JSON.stringify(phases));
    }
  }, [phases, analysisId, demoAnalysis]);

  /* Tab transition animation */
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }
  }, [activeTab]);

  const toggleStep = useCallback((phaseIdx: number, stepIdx: number) => {
    setPhases(prev => prev.map((p, pi) => pi === phaseIdx ? {
      ...p,
      steps: p.steps.map((s, si) => si === stepIdx ? { ...s, done: !s.done } : s),
    } : p));
  }, []);

  const togglePhase = useCallback((idx: number) => {
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, open: !p.open } : p));
  }, []);

  const totalSteps = phases.reduce((a, p) => a + p.steps.length, 0);
  const doneSteps = phases.reduce((a, p) => a + p.steps.filter(s => s.done).length, 0);
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const cardStyle: React.CSSProperties = {
    background: 'rgba(26, 25, 23, 0.5)',
    border: '1px solid rgba(232, 228, 220, 0.06)',
    borderRadius: '14px',
    padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
  };

  /* ─── Loading state ─── */
  // Payment success banner (shown when redirected back from Mollie)
  const paymentBanner = betaald ? (
    <div style={{
      background: 'rgba(52,211,153,0.1)',
      border: '1px solid rgba(52,211,153,0.25)',
      borderRadius: '12px',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div>
        <p style={{ color: '#34D399', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Betaling ontvangen!</p>
        <p style={{ color: 'rgba(52,211,153,0.7)', fontSize: '0.8125rem', margin: 0 }}>Uw analyse wordt nu verwerkt. Dit duurt gemiddeld 15–45 minuten.</p>
      </div>
    </div>
  ) : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E87A2E" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem' }}>Analyse laden...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ─── Processing state ─── */
  if (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.45)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
          ← Terug naar dashboard
        </Link>

        <div style={{ ...cardStyle, padding: '3rem 2rem', textAlign: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#E87A2E" strokeWidth="2" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1.5rem', display: 'block' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>

          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.75rem' }}>
            Uw analyse wordt verwerkt
          </h2>
          <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Onze AI analyseert uw winkelindeling. Dit duurt enkele minuten.
            <br />U kunt deze pagina open laten — de resultaten verschijnen automatisch.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            {[
              { label: 'Video uploaden', done: true },
              { label: 'Frames extraheren', done: analysis.status === 'processing' },
              { label: 'AI-analyse uitvoeren', done: false },
              { label: 'Visuele gids genereren', done: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: s.done ? '#34A853' : 'rgba(232,228,220,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.done && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', color: s.done ? '#E8E4DC' : 'rgba(232,228,220,0.35)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ─── Retry handler ─── */
  const handleRetry = async () => {
    setRetrying(true);
    setRetryError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Herstart mislukt');
      }
      window.location.reload();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : 'Onbekende fout');
      setRetrying(false);
    }
  };

  /* ─── Failed state ─── */
  if (analysis?.status === 'failed') {
    const _handleRetry = handleRetry; // satisfy linter


    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.45)', textDecoration: 'none' }}>← Terug naar dashboard</Link>
        <div style={{ ...cardStyle, padding: '3rem 2rem', marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(229,62,62,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.75rem' }}>Analyse mislukt</h2>
          <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Er is iets misgegaan bij het verwerken van uw video. U kunt de analyse opnieuw starten — er worden geen extra kosten in rekening gebracht.
          </p>
          {retryError && (
            <div style={{ padding: '0.75rem', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '8px', color: '#E53E3E', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {retryError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{ padding: '0.75rem 1.5rem', background: retrying ? 'rgba(232,122,46,0.5)' : '#E87A2E', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: retrying ? 'wait' : 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
            >
              {retrying ? 'Herstarten...' : '↺ Analyse opnieuw starten'}
            </button>
            <Link href="/dashboard/upload" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', background: 'transparent', color: 'rgba(232,228,220,0.5)', borderRadius: '8px', fontWeight: 500, textDecoration: 'none', fontSize: '0.9rem', border: '1px solid rgba(232,228,220,0.1)' }}>
              Nieuwe video uploaden
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Complete state ─── */
  const overview = result?.overview;
  const storeName = analysis?.store_name || 'Winkelanalyse';
  const dateStr = analysis?.created_at
    ? new Date(analysis.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const overviewStats = [
    { label: 'Totaal oppervlakte', value: overview ? `${overview.area_sqm} m²` : '-', color: '#E87A2E' },
    { label: 'Geïdentificeerde zones', value: overview ? `${overview.zones_count}` : '-', color: '#4A9EE5' },
    { label: 'Dode zones gevonden', value: overview ? `${overview.dead_zones}` : '-', color: '#E53E3E' },
    { label: 'Verwachte omzetgroei', value: overview?.growth_potential || '-', color: '#34A853' },
  ];

  const findings = result?.traffic_flow?.dead_zones?.map((dz) => ({
    color: '#E53E3E',
    text: `${dz.name}: ${dz.reason}`,
  })) || [];

  // Add bottleneck findings
  result?.traffic_flow?.bottlenecks?.forEach((b) => {
    findings.push({ color: '#DD6B20', text: b });
  });

  // Add zone issues
  result?.zones?.forEach((z) => {
    z.issues?.forEach((issue) => {
      findings.push({ color: '#4A9EE5', text: `${z.name}: ${issue}` });
    });
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href={backHref || '/dashboard'} style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.45)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          ← {backLabel || 'Terug naar dashboard'}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-syne), system-ui', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#E8E4DC', flex: '1 1 auto' }}>
            {storeName}
          </h1>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(52,168,83,0.15)', color: '#34A853', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Voltooid
          </span>

          {/* Export dropdown */}
          {result && (
            <div ref={exportRef} style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Prominente PDF download knop */}
              <button
                onClick={() => { exportPDF(storeName, analysis?.store_type || 'Winkel', result); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: '#E87A2E', color: '#fff',
                  padding: '0.5rem 1rem', borderRadius: '7px',
                  border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(232,122,46,0.3)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#D06820'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#E87A2E'; }}
              >
                ↓ Download rapport (PDF)
              </button>
              <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 1rem', borderRadius: '8px',
                  background: 'rgba(232,228,220,0.06)', border: '1px solid rgba(232,228,220,0.1)',
                  color: 'rgba(232,228,220,0.7)', fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232,228,220,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(232,228,220,0.06)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exporteer
                <span style={{ fontSize: '0.6rem', transform: exportOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {exportOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 0.35rem)', right: 0, zIndex: 50,
                  background: '#1A1917', border: '1px solid rgba(232,228,220,0.1)',
                  borderRadius: '10px', overflow: 'hidden', minWidth: '180px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <button
                    onClick={() => { exportCSV(result, storeName); setExportOpen(false); }}
                    style={{
                      width: '100%', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      background: 'none', border: 'none', color: 'rgba(232,228,220,0.7)',
                      fontSize: '0.825rem', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232,228,220,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
                    Download CSV
                  </button>
                  <div style={{ height: '1px', background: 'rgba(232,228,220,0.06)' }} />
                  <button
                    onClick={() => { exportPDF(storeName, analysis?.store_type || 'Winkel', result); setExportOpen(false); }}
                    style={{
                      width: '100%', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      background: 'none', border: 'none', color: 'rgba(232,228,220,0.7)',
                      fontSize: '0.825rem', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232,228,220,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Download PDF
                  </button>
                </div>
              )}
            </div>
              </div>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
          {dateStr}{overview ? ` · ${overview.area_sqm} m²` : ''}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(232,228,220,0.06)', marginBottom: '2rem', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.85rem 1.25rem', fontSize: '0.85rem',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#E87A2E' : 'rgba(232,228,220,0.5)',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #E87A2E' : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div ref={contentRef}>
        {/* ============ OVERZICHT ============ */}
        {activeTab === 'Overzicht' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {overviewStats.map(stat => (
                <div key={stat.label} style={{ ...cardStyle, borderTop: `3px solid ${stat.color}` }}>
                  <span style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: stat.color, display: 'block', lineHeight: 1 }}>
                    {stat.value}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.45)', marginTop: '0.5rem', display: 'block' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Zone overview with frames */}
            {result?.zones && result.zones.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                  Geïdentificeerde zones
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                  {result.zones.map((zone, i) => (
                    <div key={i} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                      {zone.frame_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={zone.frame_url} alt={zone.name} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                      )}
                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8E4DC', marginBottom: '0.35rem' }}>{zone.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.4)', marginBottom: '0.5rem' }}>{zone.area} · {zone.type}</p>
                        {zone.products?.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {zone.products.map((p, pi) => (
                              <span key={pi} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(232,228,220,0.06)', borderRadius: '4px', color: 'rgba(232,228,220,0.5)' }}>{p}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {findings.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                  Belangrijkste bevindingen
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {findings.slice(0, 6).map((f, i) => (
                    <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '1rem', borderLeft: `3px solid ${f.color}` }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color, flexShrink: 0, marginTop: '0.35rem', boxShadow: `0 0 8px ${f.color}40` }} />
                      <p style={{ fontSize: '0.9rem', color: 'rgba(232,228,220,0.7)', lineHeight: 1.5 }}>{f.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============ VLOERPLAN ============ */}
        {activeTab === 'Vloerplan' && (
          <div>
            <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <DynamicFloorPlan floorPlan={result?.floor_plan || null} />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'rgba(232,228,220,0.5)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#E87A2E', opacity: 0.4 }} /> Ingang</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#34A853', opacity: 0.4 }} /> Schappen</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#F5A623', opacity: 0.4 }} /> Kassa</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 3, background: '#E87A2E', opacity: 0.6 }} /> Looproute</span>
            </div>
          </div>
        )}

        {/* ============ IMPLEMENTATIEPLAN ============ */}
        {activeTab === 'Implementatieplan' && (
          <div>
            {/* Progress overview */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <svg viewBox="0 0 72 72" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="30" stroke="rgba(232,228,220,0.06)" strokeWidth="5" fill="none" />
                  <circle cx="36" cy="36" r="30" stroke="#E87A2E" strokeWidth="5" fill="none"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#E87A2E' }}>
                  {progress}%
                </span>
              </div>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#E8E4DC' }}>{doneSteps} van {totalSteps} stappen voltooid</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.4)', marginTop: '0.25rem' }}>
                  Verwachte omzetgroei na implementatie: {overview?.growth_potential || '+15%'}
                </p>
              </div>
            </div>

            {/* Phases */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {phases.map((phase, pi) => {
                const phaseDone = phase.steps.filter(s => s.done).length;
                return (
                  <div key={pi} style={{ ...cardStyle, borderLeft: `3px solid ${phase.color}`, padding: 0, overflow: 'hidden' }}>
                    {/* Phase header */}
                    <button
                      onClick={() => togglePhase(pi)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: 'clamp(1rem, 2vw, 1.25rem) clamp(1.25rem, 2.5vw, 1.5rem)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#E8E4DC', textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.7rem', fontWeight: 800, color: phase.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Fase {pi + 1}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{phase.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.4)' }}>{phaseDone}/{phase.steps.length}</span>
                        <span style={{ transform: phase.open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', fontSize: '0.8rem', color: 'rgba(232,228,220,0.3)' }}>▼</span>
                      </div>
                    </button>

                    {/* Phase description */}
                    {phase.open && phase.description && (
                      <p style={{ padding: '0 clamp(1.25rem, 2.5vw, 1.5rem)', fontSize: '0.825rem', color: 'rgba(232,228,220,0.45)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                        {phase.description}
                      </p>
                    )}

                    {/* Steps */}
                    {phase.open && (
                      <div style={{ padding: '0 clamp(1.25rem, 2.5vw, 1.5rem) clamp(1rem, 2vw, 1.25rem)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {phase.steps.map((step, si) => (
                          <div key={si}>
                            <button
                              onClick={() => toggleStep(pi, si)}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                padding: '0.75rem', borderRadius: '8px', textAlign: 'left',
                                background: step.done ? 'rgba(232,228,220,0.02)' : 'transparent',
                                border: 'none', cursor: 'pointer', width: '100%',
                                transition: 'background 0.2s',
                              }}
                            >
                              <div style={{
                                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: '0.1rem',
                                border: step.done ? 'none' : '2px solid rgba(232,228,220,0.2)',
                                background: step.done ? phase.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease',
                              }}>
                                {step.done && (
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <span style={{
                                  fontSize: '0.875rem', lineHeight: 1.5, display: 'block',
                                  color: step.done ? 'rgba(232,228,220,0.3)' : 'rgba(232,228,220,0.7)',
                                  textDecoration: step.done ? 'line-through' : 'none',
                                  transition: 'all 0.2s',
                                }}>
                                  {step.text}
                                </span>
                                {step.description && (
                                  <span style={{ fontSize: '0.775rem', color: 'rgba(232,228,220,0.35)', display: 'block', marginTop: '0.15rem' }}>
                                    {step.description}
                                  </span>
                                )}
                              </div>
                            </button>

                            {/* Visual step detail (expandable) */}
                            <StepVisualDetail step={step} phaseColor={phase.color} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ HEATMAP ============ */}
        {activeTab === 'Heatmap' && (
          <div>
            <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <DynamicFloorPlan
                floorPlan={result?.floor_plan || null}
                heatmapData={result?.heatmap_data}
                showHeatmap
              />
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,62,62,0.7) 0%, transparent 70%)' }} />
                <span style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)' }}>Warm (veel verkeer)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(49,130,206,0.5) 0%, transparent 70%)' }} />
                <span style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)' }}>Koud (weinig verkeer)</span>
              </div>
            </div>

            {/* Dead zones from analysis */}
            {result?.traffic_flow?.dead_zones?.map((dz, i) => (
              <div key={i} style={{ ...cardStyle, borderLeft: '3px solid #E53E3E', display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E53E3E', flexShrink: 0, marginTop: '0.35rem', boxShadow: '0 0 8px rgba(229,62,62,0.4)' }} />
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#E8E4DC', fontWeight: 600, marginBottom: '0.25rem' }}>{dz.name}</p>
                  <p style={{ fontSize: '0.825rem', color: 'rgba(232,228,220,0.5)', marginBottom: '0.35rem' }}>{dz.reason}</p>
                  <p style={{ fontSize: '0.825rem', color: '#34A853' }}>Oplossing: {dz.solution}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ GEDRAGSANALYSE ============ */}
        {activeTab === 'Gedragsanalyse' && (
          <div>
            {(!result?.behavioral_analysis || result.behavioral_analysis.behaviors.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(232,228,220,0.3)' }}>
                <p style={{ fontSize: '0.9rem' }}>Geen gedragsdata beschikbaar voor deze analyse.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Conversion bottlenecks */}
                {result.behavioral_analysis.conversion_bottlenecks?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Conversie knelpunten
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {result.behavioral_analysis.conversion_bottlenecks.map((b, i) => (
                        <div key={i} style={{ ...cardStyle, display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderLeft: '3px solid #E53E3E' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53E3E', flexShrink: 0, marginTop: '0.35rem' }} />
                          <p style={{ fontSize: '0.875rem', color: 'rgba(232,228,220,0.7)', lineHeight: 1.5 }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dwell times */}
                {result.behavioral_analysis.dwell_times?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Verblijftijd per zone
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {result.behavioral_analysis.dwell_times.map((d, i) => {
                        const secs = d.estimated_seconds;
                        const label = secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}min ${secs % 60}s`;
                        const pct = Math.min(100, Math.round((secs / 120) * 100));
                        return (
                          <div key={i} style={{ ...cardStyle }}>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.45)', marginBottom: '0.35rem' }}>{d.zone}</p>
                            <p style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 700, color: '#E87A2E', marginBottom: '0.5rem' }}>{label}</p>
                            <div style={{ height: 4, background: 'rgba(232,228,220,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#E87A2E', borderRadius: 2 }} />
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.25)', marginTop: '0.3rem' }}>
                              Betrouwbaarheid: {Math.round(d.confidence * 100)}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Behaviors */}
                {result.behavioral_analysis.behaviors?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Waargenomen klantgedrag
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {result.behavioral_analysis.behaviors.map((b, i) => {
                        const typeColors: Record<string, string> = { browsing: '#4A9EE5', buying: '#34A853', hesitating: '#F5A623', passing: 'rgba(232,228,220,0.3)' };
                        const typeLabels: Record<string, string> = { browsing: 'Browsen', buying: 'Koopintentie', hesitating: 'Twijfelen', passing: 'Doorlopen' };
                        const color = typeColors[b.behavior_type] || '#E87A2E';
                        return (
                          <div key={i} style={{ ...cardStyle, display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: `3px solid ${color}` }}>
                            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 56 }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 700, color, display: 'block', fontFamily: 'var(--font-syne)' }}>{b.count_estimate}</span>
                              <span style={{ fontSize: '0.65rem', color: 'rgba(232,228,220,0.3)' }}>personen</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E8E4DC' }}>{b.zone}</span>
                                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: `${color}20`, color }}>
                                  {typeLabels[b.behavior_type] || b.behavior_type}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.45)', lineHeight: 1.4 }}>{b.indicators}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Drop-offs */}
                {result.behavioral_analysis.drop_offs?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Afhaakmomenten
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {result.behavioral_analysis.drop_offs.sort((a, b) => b.severity - a.severity).map((d, i) => {
                        const sevColor = d.severity >= 7 ? '#E53E3E' : d.severity >= 4 ? '#F5A623' : '#34A853';
                        const typeLabel: Record<string, string> = { path_abandon: 'Route verlaten', product_reject: 'Product geweigerd', quick_exit: 'Snelle uitgang' };
                        return (
                          <div key={i} style={{ ...cardStyle }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E8E4DC' }}>{d.zone}</span>
                                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: `${sevColor}20`, color: sevColor }}>
                                  {typeLabel[d.type] || d.type}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.3)' }}>Ernst:</span>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  {Array.from({ length: 10 }).map((_, idx) => (
                                    <div key={idx} style={{ width: 6, height: 12, borderRadius: 2, background: idx < d.severity ? sevColor : 'rgba(232,228,220,0.08)' }} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)', lineHeight: 1.4 }}>
                              <strong style={{ color: '#4A9EE5' }}>Aanbeveling:</strong> {d.recommendation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ============ NEUROMARKETING ============ */}
        {activeTab === 'Neuromarketing' && (
          <div>
            {(!result?.neuromarketing || result.neuromarketing.activations.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(232,228,220,0.3)' }}>
                <p style={{ fontSize: '0.9rem' }}>Geen neuromarketing-data beschikbaar voor deze analyse.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Intro */}
                <div style={{ background: 'rgba(232,122,46,0.06)', border: '1px solid rgba(232,122,46,0.15)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(232,228,220,0.6)', lineHeight: 1.6 }}>
                    Concrete, direct uitvoerbare activaties per zone. Gebaseerd op neuromarketing-principes: persoonlijk anker, sociale bevestiging, gebruikscontext en emotionele triggers.
                  </p>
                </div>

                {/* Activaties per zone */}
                {result.neuromarketing.activations?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Activaties per zone
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {result.neuromarketing.activations.map((act, i) => (
                        <div key={i} style={{ ...cardStyle, borderLeft: '3px solid #E87A2E' }}>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E4DC' }}>{act.zone}</span>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.4)', marginLeft: '0.5rem' }}>— {act.product_or_category}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
                            {[
                              { icon: '🏷️', label: 'Label', value: act.personal_favorite_label, color: '#8B5CF6' },
                              { icon: '💬', label: 'Social proof kaartje', value: act.social_proof_card, color: '#34A853' },
                              { icon: '🕐', label: 'Gebruiksmoment', value: act.usage_context, color: '#4A9EE5' },
                              { icon: '⚡', label: 'Emotionele hook', value: act.emotional_hook, color: '#E87A2E' },
                              { icon: '📍', label: 'Placement', value: `${act.placement_advice}`, color: '#F5A623' },
                              { icon: '🖼️', label: 'Display-tip', value: act.display_tip, color: '#34D399' },
                            ].filter(item => item.value).map((item, j) => (
                              <div key={j} style={{ background: 'rgba(232,228,220,0.04)', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: item.color, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <span style={{ fontSize: '0.75rem' }}>{item.icon}</span> {item.label}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.7)', lineHeight: 1.45 }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                          {act.psychological_reason && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(232,228,220,0.35)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>🧠</span> Waarom het werkt: {act.psychological_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bundels */}
                {result.neuromarketing.bundle_suggestions?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Bundel-suggesties
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      {result.neuromarketing.bundle_suggestions.map((bundle, i) => (
                        <div key={i} style={{ ...cardStyle, borderTop: '2px solid #34A853' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E4DC' }}>{bundle.name}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34A853' }}>{bundle.price_suggestion}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {bundle.products.map((p, pi) => (
                              <span key={pi} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(52,168,83,0.1)', color: '#34A853', borderRadius: '4px' }}>{p}</span>
                            ))}
                          </div>
                          {bundle.hook && (
                            <div style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.5)', fontStyle: 'italic' }}>"{bundle.hook}"</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storytelling */}
                {result.neuromarketing.storytelling_elements?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '1rem' }}>
                      Storytelling in de winkel
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {result.neuromarketing.storytelling_elements.map((story, i) => (
                        <div key={i} style={{ ...cardStyle, borderLeft: '3px solid #8B5CF6' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>{story.format}</span>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(232,228,220,0.5)' }}>📍 {story.location}</span>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'rgba(232,228,220,0.7)', lineHeight: 1.5, fontStyle: 'italic' }}>"{story.story}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
