'use client';

import Link from 'next/link';
import AnalysisView from '@/components/dashboard/AnalysisView';
import type { AnalysisRow } from '@/lib/supabase';

/* ================================================================ */
/*  Hardcoded demo analysis for "Modevak Amsterdam"                   */
/* ================================================================ */

const DEMO_ANALYSIS: AnalysisRow = {
  id: 'demo-modevak-amsterdam',
  user_email: 'demo@smartzones.nl',
  store_name: 'Modevak Amsterdam',
  store_type: 'Kledingwinkel',
  area_sqm: 120,
  notes: null,
  target_audience: 'Modebewuste vrouwen 25-45 jaar',
  competitors: 'Zara, H&M, lokale boetieks',
  focus_areas: ['Klantenstroom', 'Productplaatsing', 'Etalage'],
  price_segment: 'Midden',
  status: 'complete',
  video_url: '',
  created_at: '2026-03-10T14:30:00Z',
  result_json: {
    overview: {
      area_sqm: 120,
      zones_count: 6,
      dead_zones: 2,
      growth_potential: '23%',
    },

    zones: [
      {
        name: 'Etalage',
        type: 'Presentatie',
        area: '8 m\u00B2',
        products: ['Seizoenscollectie', 'Topstukken', 'Nieuwe items'],
        issues: ['Verlichting te zwak voor avondpresentatie', 'Wisselfrequentie te laag (huidige cyclus: 3 weken)'],
        frame_url: '',
      },
      {
        name: 'Dames',
        type: 'Verkoopzone',
        area: '38 m\u00B2',
        products: ['Jurken', 'Blouses', 'Broeken', 'Jassen'],
        issues: ['Paden tussen rekken te smal (65 cm, minimaal 90 cm aanbevolen)', 'Signage ontbreekt per categorie'],
        frame_url: '',
      },
      {
        name: 'Heren',
        type: 'Verkoopzone',
        area: '30 m\u00B2',
        products: ['Overhemden', 'Broeken', 'Truien', 'Accessoires'],
        issues: ['Zone wordt pas laat in het looppad bereikt', 'Geen duidelijke visuele scheiding met damesafdeling'],
        frame_url: '',
      },
      {
        name: 'Accessoires',
        type: 'Impulszone',
        area: '12 m\u00B2',
        products: ['Sjaals', 'Riemen', 'Tassen', 'Sieraden'],
        issues: ['Positie te ver van kassa voor impulsaankopen'],
        frame_url: '',
      },
      {
        name: 'Paskamers',
        type: 'Service',
        area: '14 m\u00B2',
        products: [],
        issues: ['Wachtruimte ontbreekt', 'Geen spiegel buiten de cabines voor sociaal winkelen'],
        frame_url: '',
      },
      {
        name: 'Kassa',
        type: 'Afrekenpunt',
        area: '10 m\u00B2',
        products: ['Kleine accessoires', 'Cadeaukaarten'],
        issues: ['Geen impulsproducten bij wachtrij', 'Toonbank te hoog voor persoonlijk contact'],
        frame_url: '',
      },
    ],

    traffic_flow: {
      main_path: 'Ingang \u2192 Etalage \u2192 Dames (rechts) \u2192 Paskamers (achterwand) \u2192 Kassa (links voor)',
      bottlenecks: [
        'Overgang etalage naar verkoopvloer: klanten twijfelen over richting door ontbrekende routeaanduiding',
        'Paskamergebied: slechts \u00E9\u00E9n doorgang van 70 cm veroorzaakt opstoppingen bij drukte',
        'Kassa-eiland blokkeert vrij zicht op herenafdeling vanaf de ingang',
      ],
      dead_zones: [
        {
          name: 'Linker achterwand (heren hoek)',
          reason: 'Slechts 12% van de klanten bereikt dit gebied. Lage verlichting en geen visuele trekker vanuit de hoofdroute.',
          solution: 'Plaats een verlichte eye-catcher (bijv. mannequin met topoutfit) aan het begin van het pad. Voeg vloerstickers of richtingpijlen toe die naar de herenafdeling leiden.',
        },
        {
          name: 'Rechter achterwand (voorraadingang)',
          reason: 'Klanten vermijden dit gebied door industrieel uiterlijk van de voorraaddeur en lege muurpartij.',
          solution: 'Maskeer de voorraaddeur met een spiegel of productdisplay. Plaats een klein zithoekje of accessoire-eiland om het gebied aantrekkelijk te maken.',
        },
      ],
    },

    heatmap_data: [
      { zone: 'Ingang', intensity: 0.95, x: 50, y: 90, width: 18, height: 10 },
      { zone: 'Etalage', intensity: 0.85, x: 50, y: 78, width: 20, height: 10 },
      { zone: 'Dames', intensity: 0.75, x: 70, y: 50, width: 25, height: 30 },
      { zone: 'Heren', intensity: 0.35, x: 20, y: 30, width: 22, height: 28 },
      { zone: 'Accessoires', intensity: 0.5, x: 75, y: 20, width: 15, height: 15 },
      { zone: 'Paskamers', intensity: 0.65, x: 50, y: 20, width: 14, height: 18 },
      { zone: 'Kassa', intensity: 0.7, x: 25, y: 75, width: 16, height: 12 },
      { zone: 'Dode zone links', intensity: 0.1, x: 12, y: 18, width: 12, height: 15 },
      { zone: 'Dode zone rechts', intensity: 0.08, x: 88, y: 45, width: 10, height: 12 },
    ],

    floor_plan: {
      store_width: 1200,
      store_height: 900,
      svg_elements: [
        { type: 'zone', label: 'Etalage', x: 420, y: 720, width: 360, height: 130, color: '#F5A623' },
        { type: 'zone', label: 'Dames', x: 680, y: 250, width: 400, height: 420, color: '#E87A2E' },
        { type: 'zone', label: 'Heren', x: 100, y: 120, width: 350, height: 380, color: '#4A9EE5' },
        { type: 'zone', label: 'Accessoires', x: 780, y: 80, width: 280, height: 150, color: '#9B59B6' },
        { type: 'zone', label: 'Paskamers', x: 470, y: 100, width: 200, height: 250, color: '#1ABC9C' },
        { type: 'zone', label: 'Kassa', x: 100, y: 600, width: 250, height: 150, color: '#E53E3E' },
      ],
      walking_route: [
        { x: 600, y: 870 },
        { x: 600, y: 750 },
        { x: 750, y: 680 },
        { x: 880, y: 500 },
        { x: 880, y: 350 },
        { x: 800, y: 200 },
        { x: 570, y: 200 },
        { x: 400, y: 300 },
        { x: 275, y: 350 },
        { x: 275, y: 500 },
        { x: 225, y: 650 },
      ],
    },

    implementation_plan: {
      phases: [
        {
          title: 'Directe winst (week 1-2)',
          color: '#E87A2E',
          description: 'Snelle aanpassingen die zonder grote investering direct effect hebben op klantenstroom en omzet.',
          steps: [
            {
              title: 'Verplaats accessoire-eiland naar kassagebied',
              description: 'Accessoires dichter bij de kassa plaatsen voor impulsaankopen.',
              location: 'Kassa-zone',
              impact: '+8% gemiddelde bonwaarde',
              detailed_instructions: 'Verplaats het huidige accessoirerek van de rechter achterwand naar een positie direct links van de kassatoonbank. Gebruik een rond display-eiland (diameter ca. 80 cm) om sjaals, riemen en kleine sieraden te presenteren. Zorg dat het eiland niet hoger is dan 130 cm zodat het zicht op de winkel behouden blijft. Plaats de meest betaalbare items (onder \u20AC25) op ooghoogte en duurdere items eronder. Voeg een klein bordje toe: "Maak uw outfit compleet" met een pijl naar de producten. Test de positie door een week lang de bonwaarde te meten en vergelijk met de vorige week. Verlichting: voeg een gerichte spotlamp toe boven het eiland om de producten te laten opvallen. Draai het eiland elke drie dagen een kwartslag om een fris beeld te behouden voor terugkerende klanten.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 0,
            },
            {
              title: 'Voeg richtingaanwijzers toe bij ingang',
              description: 'Vloerstickers en kleine borden die klanten naar alle zones leiden.',
              location: 'Ingang / Etalage',
              impact: '+15% bereik herenafdeling',
              detailed_instructions: 'Breng drie vloerstickers aan op de overgang van etalage naar verkoopvloer. Gebruik de huisstijlkleuren en pijlvormen. Sticker 1 (rechts): "Dames \u2192" in warm oranje. Sticker 2 (links): "\u2190 Heren" in blauw. Sticker 3 (rechtdoor): "Paskamers \u2191" in groen. Materiaal: antislip vinylstickers, minimaal 30x60 cm per stuk. Bestel bij een lokale signmaker of online bij Drukwerkdeal. Plaats daarnaast een staande wegwijzer (A-bord, 60 cm hoog) op het kruispunt met dezelfde kleurcodering. Vervang de stickers elke 3 maanden of eerder bij slijtage. Meet het effect door na twee weken het aantal klanten in de herenafdeling te tellen (gebruik een handmatige telling op zaterdag 14:00-16:00 als referentie).',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 1,
            },
            {
              title: 'Verhoog etalageverlichting',
              description: 'Sterkere LED-spots in de etalage voor betere zichtbaarheid na 17:00.',
              location: 'Etalage',
              impact: '+12% passantenconversie',
              detailed_instructions: 'Vervang de huidige TL-verlichting in de etalage door drie gerichte LED-spots van minimaal 3000 lumen elk (kleurtemperatuur 3000K voor warme sfeer). Richt twee spots op de mannequins en \u00E9\u00E9n op het achterste productdisplay. Voeg een tijdschakelaar toe die de verlichting automatisch verhoogt naar 100% intensiteit vanaf 16:30 tot sluitingstijd. Overweeg LED-strips langs de bovenrand van het etalageraam voor extra randverlichting. Budget: ca. \u20AC150-250 voor spots en installatie. Laat de installatie uitvoeren door een elektricien als de bestaande fitting niet compatibel is. Meet het effect door het aantal passanten dat stopt en naar binnen kijkt te tellen gedurende een week in de avonduren (18:00-20:00) voor en na de wijziging.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 2,
            },
          ],
        },
        {
          title: 'Looppatroon verbeteren (week 3-4)',
          color: '#4A9EE5',
          description: 'Aanpassingen aan de winkelindeling om de klantenstroom te optimaliseren en dode zones te activeren.',
          steps: [
            {
              title: 'Verbreed pad bij paskamers',
              description: 'Verwijder of verplaats een rek om de doorgang bij paskamers te verbreden naar minimaal 100 cm.',
              location: 'Paskamers',
              impact: '-40% opstoppingen',
              detailed_instructions: 'Het huidige pad naar de paskamers is 70 cm breed, wat leidt tot blokkades wanneer twee klanten elkaar passeren. Verplaats het kledingrek dat direct rechts naast de paskameringang staat naar de lege wandruimte bij de herenafdeling. Dit creert een doorgang van minimaal 100 cm. Als het rek niet verplaatst kan worden, verklein het dan door twee armen te verwijderen (van 120 cm naar 80 cm breed). Markeer op de vloer met tape de gewenste vrije ruimte zodat medewerkers het rek niet per ongeluk terugschuiven. Voeg een klein bankje of kruk toe bij de wachtruimte voor de paskamers. Dit moedigt begeleiders aan om te wachten in plaats van in de doorgang te staan. Overweeg een spiegel aan de muur tegenover de paskamers zodat klanten hun outfit kunnen tonen zonder de cabine te blokkeren.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 3,
            },
            {
              title: 'Herindeling herenafdeling',
              description: 'Verplaats herenafdeling deels naar voren voor betere zichtbaarheid vanaf de ingang.',
              location: 'Heren',
              impact: '+25% bezoekers herenafdeling',
              detailed_instructions: 'Verplaats het voorste rek van de herenafdeling 150 cm naar voren richting de ingang, zodat het zichtbaar is voor klanten die binnenkomen. Gebruik een hoger rek (180 cm) als visuele trekker met een opvallend display van de bestsellers erop. Voeg bovenaan het rek een lichtbak toe met "HEREN" in de huisstijl. Plaats een mannequin met een complete outfit aan het begin van het pad naar de herenafdeling. Gebruik een donkerder vloerkleed (ca. 200x300 cm) om de herenafdeling visueel af te bakenen van de damesafdeling. Dit creert een "zone-gevoel" zonder fysieke muren. Orden de producten van casual (vooraan) naar formeel (achteraan) om een natuurlijk verloop te creeren. Verwacht resultaat: het percentage klanten dat de herenafdeling bezoekt stijgt van 12% naar minimaal 30%.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 4,
            },
            {
              title: 'Activeer linker achterwand',
              description: 'Transformeer de dode zone in een aantrekkelijk themahoekje.',
              location: 'Linker achterwand',
              impact: '+18% vloerbenutting',
              detailed_instructions: 'De linker achterwand (achter de herenafdeling) wordt momenteel door slechts 12% van de klanten bezocht. Creeer hier een "Stijlhoek" met een verlichte mannequin die elke week een nieuwe outfit draagt. Voeg een staande spiegel (minimaal 50x170 cm) toe en een klein tafeltje met styling-inspiratie (lookbook, seizoensflyer). Monteer twee wandspots op 200 cm hoogte gericht op de mannequin. Plaats een opvallend vloerkleed (rond, diameter 150 cm, contrasterende kleur) om het hoekje visueel af te bakenen. Voeg een handgeschreven krijtbord toe met "Outfit van de week" en de totaalprijs. Link dit hoekje visueel aan de hoofdroute door een lijn van drie kleine vloerstickers met pijlen. Wissel de outfit elke maandag en deel een foto op social media met de hashtag #ModevakWeekOutfit. Meet het succes door het aantal klanten dat het hoekje bezoekt te tellen gedurende twee zaterdagen.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 5,
            },
            {
              title: 'Maskeer voorraaddeur rechts',
              description: 'Verberg de industriele voorraaddeur met een spiegel of productdisplay.',
              location: 'Rechter achterwand',
              impact: '+10% winkelervaring score',
              detailed_instructions: 'De voorraaddeur aan de rechter achterwand geeft het gebied een industrieel en onafgewerkt gevoel, waardoor klanten het vermijden. Hang een grote spiegel (100x200 cm) over de deur. Gebruik een spiegel met een subtiele lijst die past bij het winkelinterieur. Bevestig de spiegel met scharnieren zodat medewerkers de deur nog steeds kunnen openen voor voorraadaanvulling. Plaats voor de spiegel een smal consoletafeltje (30 cm diep) met een selectie premium accessoires of parfums. Voeg aan weerszijden wandplanken toe met decoratieve items en extra producten. Laat een zachte, indirecte LED-strip achter de spiegel lopen voor een premium uitstraling. Het effect is drieledig: de dode zone wordt aantrekkelijk, de spiegel vergroot visueel de ruimte, en het display genereert extra omzet.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 6,
            },
          ],
        },
        {
          title: 'Visuele merchandising (week 5-6)',
          color: '#34A853',
          description: 'Professionaliseer de productpresentatie en visuele identiteit van elke zone.',
          steps: [
            {
              title: 'Installeer zone-signage systeem',
              description: 'Uniforme hangborden boven elke afdeling met kleurcodering.',
              location: 'Alle zones',
              impact: '+20% navigatiegemak',
              detailed_instructions: 'Ontwerp een uniform signage-systeem met hangborden (40x15 cm) boven elke afdeling. Gebruik de kleurcodering: Dames = warm oranje, Heren = blauw, Accessoires = paars, Paskamers = groen, Kassa = rood. Materiaal: mat zwart aluminium bord met witte tekst en een kleuraccent-lijn onderaan. Bevestig de borden aan het plafond met nylondraad op een hoogte van 230-240 cm (boven de rekken maar duidelijk zichtbaar). Voeg aan elk bord een subtiel pictogram toe naast de tekst voor internationale herkenbaarheid. Bestel bij een lokale signmaker of online (budget: ca. \u20AC200-350 voor alle borden). Laat de borden dubbelzijdig uitvoeren zodat ze van beide kanten leesbaar zijn. Controleer de positionering door vanuit de ingang te kijken: alle borden moeten in \u00E9\u00E9n oogopslag zichtbaar zijn.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 7,
            },
            {
              title: 'Herorganiseer rekken per kleurthema',
              description: 'Groepeer kleding op kleur binnen elke afdeling voor visuele rust.',
              location: 'Dames + Heren',
              impact: '+15% browsetijd',
              detailed_instructions: 'Organiseer alle kledingrekken volgens het kleurblok-principe: groepeer items van licht naar donker, van links naar rechts. Begin elk rek met witte/crme tinten, via pastels en heldere kleuren naar donkerblauw en zwart. Dit creeert visuele rust en maakt het voor klanten intutiever om te browsen. Binnen elk kleurblok, hang items van kort (bovenkleding) naar lang (jurken/jassen). Gebruik dunne kleerhangers van \u00E9\u00E9n type en kleur (mat zwart aanbevolen) voor een uniform beeld. Verwijder alle plastic kleerhangers en voorraad-tags van de verkoopvloer. Laat maximaal 2 cm ruimte tussen hangers voor een volle maar overzichtelijke presentatie. Reorganiseer de rekken elke maandagochtend na het aanvullen van nieuwe voorraad. Train medewerkers om bij het aanvullen direct de kleurvolgorde te respecteren.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 8,
            },
            {
              title: 'Creeer focuspunten per zone',
              description: 'Voeg in elke zone \u00E9\u00E9n visueel focuspunt toe dat de aandacht trekt.',
              location: 'Alle verkoopzones',
              impact: '+10% productinteractie',
              detailed_instructions: 'Elke verkoopzone heeft een visueel anker nodig dat klanten aantrekt en richting geeft. Damesafdeling: een verlichte nistoonbank (60x60 cm) met de "Pick of the Week" en bijpassende accessoires. Herenafdeling: een houten displaytafel met een gestileerd outfit-arrangement (overhemd gevouwen met riem en manchetknopen). Accessoires: een verlichte draaistandaard voor sieraden als middelpunt van het eiland. Bij elke focuspunt hoort een klein kaartje met een handgeschreven persoonlijke aanbeveling van een medewerker. Wissel de focuspunten elke week op maandag. Fotografeer elk nieuw focuspunt voor social media (Instagram stories). Budget: ca. \u20AC100-200 voor displaymaterialen als die niet al aanwezig zijn in de winkel.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 9,
            },
          ],
        },
        {
          title: 'Meten en optimaliseren (week 7-8)',
          color: '#9B59B6',
          description: 'Evalueer de resultaten van alle aanpassingen en fijn-stem waar nodig.',
          steps: [
            {
              title: 'Voer klantentelling uit',
              description: 'Tel klanten per zone op drie drukke momenten om het effect te meten.',
              location: 'Hele winkel',
              impact: 'Baseline voor verdere optimalisatie',
              detailed_instructions: 'Plan drie telmomenten in: zaterdag 11:00-12:00, woensdag 15:00-16:00 en vrijdag 17:00-18:00. Gebruik een eenvoudig telformulier (of de Smart Zones app) met rijen per zone en kolommen per kwartier. Tel per zone hoeveel klanten er aanwezig zijn op elk kwartierpunt. Vergelijk de resultaten met de oorspronkelijke analyse: de herenafdeling zou van 12% naar minimaal 25% moeten stijgen, de dode zones van <5% naar minimaal 15%. Noteer ook kwalitatieve observaties: lopen klanten soepeler door de winkel? Stoppen ze bij de focuspunten? Gebruiken ze de richtingaanwijzers? Bespreek de resultaten met het team op de eerstvolgende maandagmeeting. Herhaal de telling na vier weken om trends te identificeren.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 10,
            },
            {
              title: 'Analyseer omzetdata per zone',
              description: 'Vergelijk bondata voor en na de aanpassingen per productcategorie.',
              location: 'Kassa / Administratie',
              impact: 'Validatie van +23% groeipotentieel',
              detailed_instructions: 'Exporteer de kassadata van de afgelopen twee maanden uit het kassasysteem (als CSV of via het kassadashboard). Vergelijk de omzet per productcategorie: dameskleding, herenkleding, accessoires en impulsaankopen. Bereken het gemiddelde bonbedrag voor en na de aanpassingen. Let specifiek op: (1) is de omzet herenkleding gestegen nu de afdeling beter bereikbaar is? (2) zijn impulsaankopen bij de kassa toegenomen? (3) is het totale klantenbezoek veranderd? Maak een eenvoudige grafiek (kan in Excel) met de weekomzet per categorie. Deel de bevindingen met het team. Als bepaalde zones achterblijven, plan een specifieke actie: extra aandacht in etalage, social media promotie, of een aanpassing van de productmix. Stel een maandelijkse review in om de voortgang te blijven volgen.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 11,
            },
            {
              title: 'Optimaliseer op basis van resultaten',
              description: 'Pas de winkelindeling aan op basis van de meetresultaten.',
              location: 'Hele winkel',
              impact: 'Continu verbeteringsproces',
              detailed_instructions: 'Na het analyseren van de klantentelling en omzetdata, identificeer de drie gebieden met de grootste verbetering en de drie gebieden die achterblijven. Voor gebieden die goed presteren: documenteer wat werkt en maak het onderdeel van de standaardprocedure. Voor achterblijvende gebieden: brainstorm met het team over mogelijke oorzaken. Veelvoorkomende issues: verkeerde producten in de zone, onvoldoende verlichting, of onlogische routing. Maak een actieplan met maximaal drie aanpassingen per twee weken. Test elke aanpassing minimaal twee weken voordat je het effect beoordeelt. Gebruik de A/B-methode waar mogelijk: verander \u00E9\u00E9n ding tegelijk om het effect te isoleren. Plan een kwartaalreview waarin alle veranderingen worden geevalueerd en de volgende prioriteiten worden bepaald. Overweeg een herhaalanalyse via Smart Zones na drie maanden voor een frisse blik.',
              visual_before_url: '',
              visual_after_url: '',
              frame_index: 12,
            },
          ],
        },
      ],
    },

    frame_urls: [],
  },
};

/* ================================================================ */
/*  Demo Page                                                         */
/* ================================================================ */

export default function DemoPage() {
  return (
    <div style={{ background: '#111110', minHeight: '100vh' }}>
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #E87A2E, #D06820)',
          padding: '0.85rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
          Dit is een voorbeeldanalyse — Upload uw eigen video voor \u20AC199
        </span>
        <Link
          href="/dashboard/upload"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1.1rem',
            background: '#fff',
            color: '#E87A2E',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'transform 0.2s',
          }}
        >
          Start uw analyse &rarr;
        </Link>
      </div>

      {/* Analysis content */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
        }}
      >
        <AnalysisView
          demoAnalysis={DEMO_ANALYSIS}
          backHref="/"
          backLabel="Terug naar homepage"
        />
      </div>
    </div>
  );
}
