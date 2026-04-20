import { getAnthropicClient } from './anthropic';
import { frameUrlToBase64 } from './video-processor';
import { supabase } from './supabase';
import type { AnalysisResult } from './supabase';

interface StoreContext {
  storeName: string;
  storeType: string;
  areaSqm: number | null;
  notes: string | null;
  target_audience?: string | null;
  competitors?: string | null;
  focus_areas?: string[] | null;
  price_segment?: string | null;
}

async function getDefaultTonePrefix(): Promise<string> {
  try {
    const { data } = await supabase
      .from('tone_config')
      .select('system_prompt_prefix')
      .eq('is_default', true)
      .single();
    return (data as { system_prompt_prefix: string } | null)?.system_prompt_prefix || '';
  } catch {
    return '';
  }
}

function buildContextBlock(context: StoreContext): string {
  return `
WINKELCONTEXT (gebruik dit actief in alle aanbevelingen):
- Naam: ${context.storeName}
- Type winkel: ${context.storeType}
- Oppervlakte: ${context.areaSqm ? `${context.areaSqm} m²` : 'onbekend'}
- Doelgroep: ${context.target_audience || 'algemeen publiek'}
- Directe concurrenten: ${context.competitors || 'niet opgegeven'}
- Prijssegment: ${context.price_segment || 'midden'}
- Focusgebieden: ${context.focus_areas?.join(', ') || 'alle gebieden'}
${context.notes ? `- Extra notities: ${context.notes}` : ''}

BELANGRIJK: Stem ALLE aanbevelingen af op het type winkel, de doelgroep en het onderscheid met de concurrenten.
Noem de concurrenten expliciet als dat relevant is voor een aanbeveling.`;
}

export async function runAnalysis(
  frameUrls: string[],
  context: StoreContext,
): Promise<AnalysisResult> {
  const client = await getAnthropicClient();

  const frameImages = await Promise.all(
    frameUrls.map(async (url) => {
      const base64 = await frameUrlToBase64(url);
      return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: base64 },
      };
    }),
  );

  const tonePrefix = await getDefaultTonePrefix();
  const contextBlock = buildContextBlock(context);

  // ── CALL 1: Indeling & zones ───────────────────────────────
  const layoutAnalysis = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    ...(tonePrefix ? { system: tonePrefix } : {}),
    messages: [{
      role: 'user',
      content: [
        ...frameImages,
        {
          type: 'text',
          text: `Je bent een expert retail winkelindeling analist.
${contextBlock}

Analyseer de winkelindeling. Houd rekening met de doelgroep (${context.target_audience || 'algemeen'}) en concurrenten (${context.competitors || 'onbekend'}) bij het beoordelen van problemen.

Retourneer ALLEEN dit JSON object:
{
  "estimated_area_sqm": <number>,
  "zones": [
    {
      "name": "<zone naam NL>",
      "type": "<entrance|aisle|display|checkout|storage|fitting_room|other>",
      "area": "<bijv. '15 m²'>",
      "products": ["<categorie>"],
      "issues": ["<concreet probleem, max 10 woorden per punt>"],
      "frame_index": <0-indexed>
    }
  ],
  "store_dimensions": { "width_estimate": <m>, "height_estimate": <m> },
  "lighting_notes": "<max 20 woorden>",
  "signage_notes": "<max 20 woorden>"
}`,
        },
      ],
    }],
  });

  const layoutJson = extractJson(layoutAnalysis.content[0]);

  // ── CALL 2: Klantenstroom ──────────────────────────────────
  const trafficAnalysis = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    ...(tonePrefix ? { system: tonePrefix } : {}),
    messages: [{
      role: 'user',
      content: [
        ...frameImages,
        {
          type: 'text',
          text: `Je bent een expert klantenstroom-analist.
${contextBlock}

Eerdere indeling: ${JSON.stringify(layoutJson?.zones?.map((z: { name: string; type: string }) => ({ name: z.name, type: z.type })) || [])}

Analyseer klantenstromen. Let op: doelgroep ${context.target_audience || 'algemeen'} heeft specifiek loopgedrag.

Retourneer ALLEEN dit JSON:
{
  "main_path": "<beschrijving hoofdroute, max 30 woorden>",
  "bottlenecks": ["<knelpunt + locatie, max 15 woorden>"],
  "dead_zones": [
    {
      "name": "<zone>",
      "reason": "<waarom overgeslagen, max 15 woorden>",
      "solution": "<concrete fix, max 15 woorden>"
    }
  ],
  "heatmap_data": [
    {
      "zone": "<naam>",
      "intensity": <0.0-1.0>,
      "x": <0-100>,
      "y": <0-100>,
      "width": <percentage>,
      "height": <percentage>
    }
  ],
  "flow_score": <1-10>
}`,
        },
      ],
    }],
  });

  const trafficJson = extractJson(trafficAnalysis.content[0]);

  // ── CALL 2.5: Gedragsanalyse ───────────────────────────────
  const behavioralAnalysis = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    ...(tonePrefix ? { system: tonePrefix } : {}),
    messages: [{
      role: 'user',
      content: [
        ...frameImages,
        {
          type: 'text',
          text: `Je bent expert klantgedrag-analist voor ${context.storeType}.
${contextBlock}

Zones: ${JSON.stringify(layoutJson?.zones?.map((z: { name: string }) => z.name) || [])}
Hoofdstroom: ${trafficJson?.main_path || 'onbekend'}

Analyseer zichtbaar klantgedrag. Houd rekening met de specifieke doelgroep: ${context.target_audience || 'algemeen'}.

Retourneer ALLEEN dit JSON:
{
  "behaviors": [
    {
      "zone": "<zone>",
      "behavior_type": "browsing"|"buying"|"hesitating"|"passing",
      "confidence": <0.0-1.0>,
      "indicators": "<wat je zag, max 20 woorden>",
      "count_estimate": <aantal>
    }
  ],
  "dwell_times": [
    { "zone": "<zone>", "estimated_seconds": <sec>, "confidence": <0.0-1.0> }
  ],
  "drop_offs": [
    {
      "zone": "<zone>",
      "type": "path_abandon"|"product_reject"|"quick_exit",
      "severity": <1-10>,
      "recommendation": "<concrete actie, max 15 woorden>"
    }
  ],
  "conversion_bottlenecks": ["<bottleneck, max 12 woorden>"]
}`,
        },
      ],
    }],
  });

  const behavioralJson = extractJson(behavioralAnalysis.content[0]);

  // ── CALL 3: Vloerplan ──────────────────────────────────────
  const floorPlanAnalysis = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    ...(tonePrefix ? { system: tonePrefix } : {}),
    messages: [{
      role: 'user',
      content: [
        ...frameImages,
        {
          type: 'text',
          text: `Je bent winkelindeling architect voor ${context.storeType}.
${contextBlock}

Indeling: ${JSON.stringify(layoutJson, null, 2)}
Stroom: ${JSON.stringify(trafficJson, null, 2)}

Genereer optimale bovenaanzicht plattegrond.

Retourneer ALLEEN dit JSON:
{
  "store_width": <eenheden>,
  "store_height": <eenheden>,
  "svg_elements": [
    {
      "type": "<shelf|display|entrance|checkout|wall|fitting_room|counter|aisle>",
      "label": "<naam>",
      "x": <pos>,
      "y": <pos>,
      "width": <breedte>,
      "height": <hoogte>,
      "color": "<#hex>"
    }
  ],
  "walking_route": [{"x": <x>, "y": <y>}]
}`,
        },
      ],
    }],
  });

  const floorPlanJson = extractJson(floorPlanAnalysis.content[0]);

  // ── CALL 4: Implementatieplan (quick wins eerst) ───────────
  const implementationAnalysis = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8192,
    ...(tonePrefix ? { system: tonePrefix } : {}),
    messages: [{
      role: 'user',
      content: [{
        type: 'text',
        text: `Je bent retail optimalisatie consultant voor ${context.storeType}.
${contextBlock}

Indeling: ${JSON.stringify(layoutJson, null, 2)}
Klantenstromen: ${JSON.stringify(trafficJson, null, 2)}

Maak een implementatieplan met 4 fasen.

KRITISCH — FASE VOLGORDE:
- Fase 1 = QUICK WINS: Geen kosten, max 1 uur werk, direct resultaat (labels verzetten, producten verplaatsen, bordje bijhangen)
- Fase 2 = LAGE INSPANNING, HOGE IMPACT: Klein budget (<€200), 1 dag werk
- Fase 3 = MIDDELGROTE AANPASSINGEN: Budget €200-1000, week werk
- Fase 4 = GROTERE INVESTERINGEN: Alleen als écht noodzakelijk

Stem alles af op:
- Doelgroep: ${context.target_audience || 'algemeen'}
- Onderscheid van concurrenten: ${context.competitors || 'onbekend'}
- Winkeltype: ${context.storeType}

SCHRIJFSTIJL: Gebruik korte, scanbare instructies. Gebruik bullet points. Geen lange alinea's.

Retourneer ALLEEN dit JSON:
{
  "growth_potential": "<bijv. '+18%'>",
  "phases": [
    {
      "title": "<fase titel NL>",
      "color": "<#E87A2E|#4A9EE5|#34A853|#F5A623>",
      "description": "<max 20 woorden>",
      "steps": [
        {
          "title": "<stap titel, max 8 woorden>",
          "description": "<max 20 woorden>",
          "location": "<exacte locatie>",
          "impact": "<verwacht effect, bijv. '+5%'>",
          "frame_index": <0-indexed>,
          "detailed_instructions": "<SCANBARE instructie met bullet points. Gebruik '• ' voor elk punt. Minimaal 5 bullets, elk max 15 woorden. Start met actie-werkwoord. Specifiek voor dit winkeltype en deze doelgroep. Noem concurrenten als relevant.>"
        }
      ]
    }
  ]
}`,
      }],
    }],
  });

  const implementationJson = extractJson(implementationAnalysis.content[0]);

  // ── CALL 5: Neuromarketing & Productbeleving ───────────────
  const neuromarketingAnalysis = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 6144,
    ...(tonePrefix ? { system: tonePrefix } : {}),
    messages: [{
      role: 'user',
      content: [
        ...frameImages,
        {
          type: 'text',
          text: `Je bent een neuromarketing expert en retail-psycholoog gespecialiseerd in ${context.storeType}.
${contextBlock}

Zones: ${JSON.stringify(layoutJson?.zones?.map((z: { name: string; products: string[] }) => ({ name: z.name, products: z.products })) || [])}

Genereer per OPVALLENDE zone of product een concrete, laagdrempelige activatie die direct uitvoerbaar is.
GEEN generieke tekst. Alles afgestemd op ${context.storeName} (${context.storeType}) en de doelgroep: ${context.target_audience || 'algemeen'}.

Voor elke activatie:
- Persoonlijke favoriet: concrete naam/label suggestie
- Micro social proof: tekst voor een displaykaartje
- Gebruikscontext: wanneer/waarvoor het product wordt gebruikt
- Emotionele hook: impuls-trigger woord of zin
- Placement: exacte plek in de winkel met reden
- Psychologische onderbouwing: waarom dit werkt (max 15 woorden)

Retourneer ALLEEN dit JSON:
{
  "activations": [
    {
      "zone": "<zone naam>",
      "product_or_category": "<specifiek product of categorie>",
      "personal_favorite_label": "<bijv. 'Favoriete keuze van [naam]' of 'Ons team kiest dit elke vrijdag'>",
      "social_proof_card": "<tekst voor displaykaartje, bijv. 'Veel klanten nemen dit mee voor de vrijdagavondborrel'>",
      "usage_context": "<bijv. 'Perfect voor bij de koffie van vanmiddag' of 'Ideaal als weekendcadeau'>",
      "emotional_hook": "<bijv. 'weekendfavoriet' | 'verwenmoment' | 'voor vanavond' | 'klein cadeautje'>",
      "placement_advice": "<exacte plek: bijv. 'Naast kassa op ooghoogte, rechts van de kassa'>",
      "placement_reason": "<waarom: bijv. 'hoge dwell time, klanten staan hier stil'>",
      "psychological_reason": "<max 15 woorden waarom dit koopgedrag triggert>",
      "display_tip": "<concreet display-idee, bijv. 'Klein bordje met krulschrift, warm licht erboven'>"
    }
  ],
  "bundle_suggestions": [
    {
      "name": "<bundelnaam>",
      "products": ["<product 1>", "<product 2>"],
      "price_suggestion": "<bijv. '€19,95 samen'>",
      "hook": "<verkoopzin voor het bundle-label>"
    }
  ],
  "storytelling_elements": [
    {
      "location": "<waar in de winkel>",
      "story": "<kort verhaal of context dat klanten raakt, bijv. 'Dit recept deelde onze vaste klant Marian met ons...'>",
      "format": "<hoe te tonen: 'handgeschreven kaartje' | 'klein display' | 'sfeerfoto' | 'korte video 5-10 sec'>"
    }
  ]
}`,
        },
      ],
    }],
  });

  const neuroJson = extractJson(neuromarketingAnalysis.content[0]);

  // ── Samengesteld resultaat ─────────────────────────────────
  const result: AnalysisResult = {
    overview: {
      area_sqm: layoutJson.estimated_area_sqm || context.areaSqm || 100,
      zones_count: layoutJson.zones?.length || 0,
      dead_zones: trafficJson.dead_zones?.length || 0,
      growth_potential: implementationJson.growth_potential || '+15%',
    },
    zones: (layoutJson.zones || []).map((zone: Record<string, unknown>) => ({
      name: zone.name as string,
      type: zone.type as string,
      area: zone.area as string,
      products: (zone.products as string[]) || [],
      issues: (zone.issues as string[]) || [],
      frame_url: frameUrls[(zone.frame_index as number) || 0] || frameUrls[0],
    })),
    traffic_flow: {
      main_path: trafficJson.main_path || '',
      bottlenecks: trafficJson.bottlenecks || [],
      dead_zones: trafficJson.dead_zones || [],
    },
    heatmap_data: trafficJson.heatmap_data || [],
    floor_plan: {
      svg_elements: floorPlanJson.svg_elements || [],
      walking_route: floorPlanJson.walking_route || [],
      store_width: floorPlanJson.store_width || 1200,
      store_height: floorPlanJson.store_height || 900,
    },
    implementation_plan: {
      phases: (implementationJson.phases || []).map((phase: Record<string, unknown>) => ({
        title: phase.title as string,
        color: phase.color as string,
        description: phase.description as string,
        steps: ((phase.steps as Array<Record<string, unknown>>) || []).map((step) => ({
          title: step.title as string,
          description: step.description as string,
          location: step.location as string,
          impact: step.impact as string,
          detailed_instructions: step.detailed_instructions as string,
          visual_before_url: '',
          visual_after_url: '',
          frame_index: (step.frame_index as number) || 0,
        })),
      })),
    },
    frame_urls: frameUrls,
    behavioral_analysis: {
      behaviors: behavioralJson?.behaviors || [],
      dwell_times: behavioralJson?.dwell_times || [],
      drop_offs: behavioralJson?.drop_offs || [],
      conversion_bottlenecks: behavioralJson?.conversion_bottlenecks || [],
    },
    neuromarketing: {
      activations: neuroJson?.activations || [],
      bundle_suggestions: neuroJson?.bundle_suggestions || [],
      storytelling_elements: neuroJson?.storytelling_elements || [],
    },
  };

  return result;
}

// ── JSON extractie helper ──────────────────────────────────
function extractJson(content: { type: string; text?: string }): Record<string, unknown> {
  if (content.type !== 'text' || !content.text) return {};
  const text = content.text.trim();
  const startBrace = text.indexOf('{');
  const endBrace = text.lastIndexOf('}');
  if (startBrace === -1 || endBrace === -1) return {};
  try {
    return JSON.parse(text.slice(startBrace, endBrace + 1));
  } catch {
    return {};
  }
}
