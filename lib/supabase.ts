import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

// Server-side client with service role (full access)
// Lazy-initialized to avoid crashing when env vars are not set
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_KEY in via .env.local',
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Re-export as `supabase` for convenience (getter proxy)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Database types
export interface AnalysisRow {
  id: string;
  user_email: string;
  store_name: string;
  store_type: string;
  area_sqm: number | null;
  notes: string | null;
  target_audience: string | null;
  competitors: string | null;
  focus_areas: string[] | null;
  price_segment: string | null;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  video_url: string;
  result_json: AnalysisResult | null;
  created_at: string;
}

export interface AnalysisResult {
  overview: {
    area_sqm: number;
    zones_count: number;
    dead_zones: number;
    growth_potential: string;
  };
  zones: Array<{
    name: string;
    type: string;
    area: string;
    products: string[];
    issues: string[];
    frame_url: string;
  }>;
  traffic_flow: {
    main_path: string;
    bottlenecks: string[];
    dead_zones: Array<{ name: string; reason: string; solution: string }>;
  };
  heatmap_data: Array<{
    zone: string;
    intensity: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  floor_plan: {
    svg_elements: Array<{
      type: string;
      label: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>;
    walking_route: Array<{ x: number; y: number }>;
    store_width: number;
    store_height: number;
  };
  implementation_plan: {
    phases: Array<{
      title: string;
      color: string;
      description: string;
      steps: Array<{
        title: string;
        description: string;
        location: string;
        impact: string;
        detailed_instructions: string;
        visual_before_url: string;
        visual_after_url: string;
        frame_index: number;
      }>;
    }>;
  };
  frame_urls: string[];
  behavioral_analysis?: {
    behaviors: Array<{
      zone: string;
      behavior_type: 'browsing' | 'buying' | 'hesitating' | 'passing';
      confidence: number;
      indicators: string;
      count_estimate: number;
    }>;
    dwell_times: Array<{
      zone: string;
      estimated_seconds: number;
      confidence: number;
    }>;
    drop_offs: Array<{
      zone: string;
      type: 'path_abandon' | 'product_reject' | 'quick_exit';
      severity: number;
      recommendation: string;
    }>;
    conversion_bottlenecks: string[];
  };
  neuromarketing?: {
    activations: Array<{
      zone: string;
      product_or_category: string;
      personal_favorite_label: string;
      social_proof_card: string;
      usage_context: string;
      emotional_hook: string;
      placement_advice: string;
      placement_reason: string;
      psychological_reason: string;
      display_tip: string;
    }>;
    bundle_suggestions: Array<{
      name: string;
      products: string[];
      price_suggestion: string;
      hook: string;
    }>;
    storytelling_elements: Array<{
      location: string;
      story: string;
      format: string;
    }>;
  };
}
