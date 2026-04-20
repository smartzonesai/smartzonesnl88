import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { message, history, prospects } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Bericht is verplicht' }, { status: 400 });
    }

    const client = await getAnthropicClient();

    const pipelineContext = prospects?.length
      ? `\n\nHUIDIGE PROSPECT PIPELINE (${prospects.length} prospects):\n${prospects.map((p: { company: string; stage: string; storeType: string; score: number; notes: string }) =>
          `- ${p.company} | Type: ${p.storeType} | Fase: ${p.stage} | Score: ${p.score} | Notes: ${p.notes}`
        ).join('\n')}`
      : '';

    const systemPrompt = `Je bent de AI Outreach Strategist voor SmartZones, een Nederlands SaaS-platform dat AI-gestuurde winkelindelingsanalyses aanbiedt aan retailbedrijven voor €199 per analyse.

JE ROL:
Je bent geen simpele copywriter — je bent een strategische outreach adviseur. Je hebt toegang tot de volledige prospect pipeline en gebruikt deze data om:

1. PRIORITEITEN te stellen: Welke prospects moeten als eerste benaderd worden op basis van score, timing, en potentieel
2. STRATEGIE te bepalen: Welk kanaal (email, LinkedIn, telefoon), welke boodschap, welke timing
3. PERSONALISEREN: Elke outreach aanpassen aan het type winkel, de grootte, en de specifieke situatie
4. SEQUENCES te ontwerpen: Multi-touch campagnes met 3-4 emails die opbouwen naar een conversie
5. ANALYSEREN: Reply rates, open rates, en conversie verbeteren op basis van data

SMARTZONES WAARDEPROPOSITIE:
- Gemiddeld +20% omzetgroei na implementatie
- AI analyseert een video van de winkel → compleet rapport in < 1 uur
- Inclusief: vloerplan, heatmap, stap-voor-stap implementatiegids met visuele annotaties
- Eenmalig €199 — geen abonnement
- USP: De enige tool die video-analyse combineert met AI-gegenereerde visuele implementatiegidsen

OUTREACH PRINCIPES:
- Gebruik het PAS-framework (Problem → Agitate → Solution)
- Onderwerpregels: kort, specifiek, geen spam-woorden
- Eerste zin: haak in op hun specifieke situatie (winkeltype, stad, recent nieuws)
- CTA: altijd laagdrempelig ("15 min call" of "gratis quickscan")
- Toon: professioneel maar warm, geen corporate-taal
- Follow-ups: refereer aan vorige email, voeg nieuwe waarde toe

${pipelineContext}

INSTRUCTIES:
- Antwoord altijd in het Nederlands
- Als je een email genereert, voeg een JSON blok toe in dit formaat:
\`\`\`email
{"subject": "onderwerpregel", "body": "volledige email tekst", "targetName": "naam", "targetCompany": "bedrijf"}
\`\`\`
- Bij strategie-vragen: wees specifiek, geef concrete acties met deadlines
- Bij pipeline-analyse: rangschik op prioriteit en leg uit waarom
- Gebruik data uit de pipeline om advies te personaliseren`;

    const messages = [
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract email JSON if present
    let email = null;
    const emailMatch = text.match(/```email\s*\n?([\s\S]*?)\n?```/);
    if (emailMatch) {
      try { email = JSON.parse(emailMatch[1].trim()); } catch { /* ignore */ }
    }

    const cleanResponse = text.replace(/```email[\s\S]*?```/g, '').trim();

    return NextResponse.json({ response: cleanResponse, email });
  } catch (err) {
    console.error('[Outreach] Error:', err);
    return NextResponse.json(
      { error: 'AI verwerking mislukt', response: 'Er ging iets mis. Probeer het opnieuw.' },
      { status: 500 },
    );
  }
}
