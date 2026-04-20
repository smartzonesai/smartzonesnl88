import type { AnalysisResult } from './supabase';

interface ValidationResult {
  score: number; // 0-100
  warnings: string[];
}

/**
 * Validate an analysis result for reasonableness.
 * Checks zone counts, area estimates, growth percentages, and structural completeness.
 */
export function validateResult(result: AnalysisResult): ValidationResult {
  const warnings: string[] = [];
  let score = 100;

  // Check overview
  if (!result.overview) {
    warnings.push('Geen overzicht gegenereerd');
    score -= 30;
  } else {
    if (result.overview.area_sqm < 10 || result.overview.area_sqm > 10000) {
      warnings.push(`Onrealistische oppervlakte: ${result.overview.area_sqm}m²`);
      score -= 10;
    }
    if (result.overview.zones_count < 1 || result.overview.zones_count > 30) {
      warnings.push(`Onrealistisch aantal zones: ${result.overview.zones_count}`);
      score -= 10;
    }
    const growth = parseFloat(result.overview.growth_potential);
    if (!isNaN(growth) && (growth < 0 || growth > 100)) {
      warnings.push(`Onrealistisch groeipotentieel: ${result.overview.growth_potential}`);
      score -= 10;
    }
  }

  // Check zones
  if (!result.zones || result.zones.length === 0) {
    warnings.push('Geen zones geïdentificeerd');
    score -= 20;
  } else {
    const emptyZones = result.zones.filter(z => !z.name || z.name.length < 2);
    if (emptyZones.length > 0) {
      warnings.push(`${emptyZones.length} zones zonder geldige naam`);
      score -= 5;
    }
  }

  // Check traffic flow
  if (!result.traffic_flow?.main_path) {
    warnings.push('Geen hoofdlooproute geïdentificeerd');
    score -= 10;
  }

  // Check heatmap
  if (!result.heatmap_data || result.heatmap_data.length === 0) {
    warnings.push('Geen heatmap data gegenereerd');
    score -= 10;
  } else {
    const outOfBounds = result.heatmap_data.filter(h => h.x < 0 || h.x > 100 || h.y < 0 || h.y > 100);
    if (outOfBounds.length > 0) {
      warnings.push(`${outOfBounds.length} heatmap zones buiten bereik`);
      score -= 5;
    }
  }

  // Check floor plan
  if (!result.floor_plan?.svg_elements || result.floor_plan.svg_elements.length === 0) {
    warnings.push('Geen plattegrond elementen gegenereerd');
    score -= 10;
  }

  // Check implementation plan
  if (!result.implementation_plan?.phases || result.implementation_plan.phases.length === 0) {
    warnings.push('Geen implementatieplan gegenereerd');
    score -= 20;
  } else {
    const emptyPhases = result.implementation_plan.phases.filter(p => !p.steps || p.steps.length === 0);
    if (emptyPhases.length > 0) {
      warnings.push(`${emptyPhases.length} fasen zonder stappen`);
      score -= 5;
    }
    const shortInstructions = result.implementation_plan.phases
      .flatMap(p => p.steps || [])
      .filter(s => (s.detailed_instructions?.length || 0) < 50);
    if (shortInstructions.length > 0) {
      warnings.push(`${shortInstructions.length} stappen met te korte instructies`);
      score -= 5;
    }
  }

  return { score: Math.max(0, score), warnings };
}

/**
 * Normalize an analysis result by clamping outlier values to reasonable bounds.
 */
export function normalizeResult(result: AnalysisResult): AnalysisResult {
  const normalized = structuredClone(result);

  // Clamp area
  if (normalized.overview) {
    normalized.overview.area_sqm = Math.max(10, Math.min(10000, normalized.overview.area_sqm));
    normalized.overview.zones_count = Math.max(1, Math.min(30, normalized.overview.zones_count));

    const growth = parseFloat(normalized.overview.growth_potential);
    if (!isNaN(growth)) {
      normalized.overview.growth_potential = `${Math.max(5, Math.min(50, growth))}%`;
    }
  }

  // Clamp heatmap positions
  if (normalized.heatmap_data) {
    normalized.heatmap_data = normalized.heatmap_data.map(h => ({
      ...h,
      x: Math.max(0, Math.min(100, h.x)),
      y: Math.max(0, Math.min(100, h.y)),
      width: Math.max(5, Math.min(50, h.width)),
      height: Math.max(5, Math.min(50, h.height)),
      intensity: Math.max(0, Math.min(1, h.intensity)),
    }));
  }

  // Clamp dwell times
  if (normalized.behavioral_analysis?.dwell_times) {
    normalized.behavioral_analysis.dwell_times = normalized.behavioral_analysis.dwell_times.map(d => ({
      ...d,
      estimated_seconds: Math.max(5, Math.min(600, d.estimated_seconds)),
      confidence: Math.max(0, Math.min(1, d.confidence)),
    }));
  }

  // Clamp drop-off severity
  if (normalized.behavioral_analysis?.drop_offs) {
    normalized.behavioral_analysis.drop_offs = normalized.behavioral_analysis.drop_offs.map(d => ({
      ...d,
      severity: Math.max(1, Math.min(10, d.severity)),
    }));
  }

  return normalized;
}
