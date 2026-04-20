import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';

export const maxDuration = 120;

/**
 * Market Research AI agent with real web search capabilities.
 * Uses Google search to find actual small retailers, then Claude to analyze them.
 */

/**
 * Use Claude's built-in web search tool to find real businesses.
 * This is the most reliable method as Claude handles the search natively.
 */
async function searchWithClaude(query: string, client: Awaited<ReturnType<typeof getAnthropicClient>>): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Zoek op het internet naar: ${query}

Zoek specifiek naar:
1. Echte kleine winkels (1-5 medewerkers) in Nederland
2. Hun locatie, type winkel, en indien mogelijk de eigenaar/manager
3. Focus op onafhankelijke retailers, geen grote ketens

Geef de zoekresultaten terug met voor elke gevonden winkel: naam, adres/stad, type, en eventuele extra info.`,
      }],
    });

    // Extract all text content from the response
    const texts: string[] = [];
    for (const block of response.content) {
      if (block.type === 'text') texts.push(block.text);
    }

    return texts.join('\n\n') || 'Geen resultaten gevonden.';
  } catch (err) {
    console.error('[Search] Claude web search error:', err);
    return `Zoekfout: ${err instanceof Error ? err.message : 'onbekend'}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Bericht is verplicht' }, { status: 400 });
    }

    const client = await getAnthropicClient();

    // Determine if we need to search based on the user's message
    const needsSearch = /zoek|vind|scrape|identificeer|kleine|winkels|retailers|lijst|nieuwe leads|markt/i.test(message);

    let searchContext = '';
    if (needsSearch) {
      console.log(`[Market Research] Running web search for: "${message}"`);
      const searchResults = await searchWithClaude(message, client);
      searchContext = `\n═══ LIVE ZOEKRESULTATEN ═══\n${searchResults}\n═══ EINDE ZOEKRESULTATEN ═══\n`;
      console.log(`[Market Research] Search complete, ${searchResults.length} chars`);
    }

    const systemPrompt = `Je bent een expert marktonderzoeker voor SmartZones, een Nederlands SaaS-platform dat AI-gestuurde winkelindelingsanalyses aanbiedt (€199 per analyse).

BELANGRIJK: Je hebt toegang tot LIVE zoekresultaten. Wanneer zoekresultaten worden meegeleverd, gebruik deze om ECHTE bedrijven te identificeren en te analyseren. Verzin GEEN bedrijven — gebruik alleen echte namen uit de zoekresultaten of geef duidelijk aan als je geen echte resultaten hebt gevonden.

Je taken:
1. ZOEK echte kleine retailers (1-5 medewerkers) via de meegeleverde zoekresultaten
2. Analyseer elke gevonden winkel: type, locatie, geschatte grootte, potentieel als klant
3. Geef een lead score (1-100) gebaseerd op: grootte, type winkel, locatie, en geschatte behoefte aan optimalisatie
4. Identificeer de waarschijnlijke eigenaar/beslisser
5. Geef concrete outreach suggesties per lead

Output formaat per gevonden lead:
📍 **[Bedrijfsnaam]** — [Stad]
- Type: [winkeltype]
- Geschatte grootte: [klein/middelgroot]
- Lead Score: [X/100]
- Waarom interessant: [reden]
- Aanbevolen aanpak: [outreach strategie]

Geef ook een samenvattende marktanalyse met:
- Totaal gevonden potentiële leads
- Meest belovende segment
- Aanbevolen volgende stappen

Antwoord altijd in het Nederlands. Wees eerlijk als zoekresultaten beperkt zijn — zeg dan wat je wel hebt gevonden en stel voor hoe je beter kunt zoeken.`;

    const messages = [
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: searchContext
          ? `${message}\n\nHieronder staan live zoekresultaten die je moet gebruiken:\n${searchContext}`
          : message,
      },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ response: text });
  } catch (err) {
    console.error('[Market Research] Error:', err);
    return NextResponse.json(
      { error: 'AI verwerking mislukt', response: 'Er ging iets mis bij het verwerken van uw vraag. Probeer het opnieuw.' },
      { status: 500 },
    );
  }
}
