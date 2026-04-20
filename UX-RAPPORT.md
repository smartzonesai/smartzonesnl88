# SmartZones — UX/UI Conversie Rapport
## Voor lokale winkeliers: kappers, restaurants, boetieks, salons, fietswinkels

**Doel:** Meer bezoekers converteren tot betalende klanten.
**Aanpak:** Alleen copy, layout, styling — geen code-logica aangeraakt.

---

## SAMENVATTING PROBLEMEN

De huidige site spreekt een IT-publiek aan, niet een winkelier. Woorden als "computer vision", "decompressiezone", "klantenstroom-mapping", "hotspots" en een neuraal netwerk-visualisatie zijn onbegrijpelijk voor een kapper of salonhouder. De winkelier denkt: *"Dit is niet voor mij."* en klikt weg.

---

## SECTIE 1 — NAVIGATIE

### Huidig probleem
De navbar heeft alleen het logo, 5 onzichtbare voortgangsdots en een "Inloggen"-knop. Nieuwe bezoekers zien geen reden om te blijven of door te scrollen.

### Verbeterde versie

**Logo:** Behouden — "Smart Zones." werkt.

**Voortgangsdots:** Vervang de anonieme dots door korte tekstlabels:
```
Hoe het werkt  |  Wat u krijgt  |  Prijzen  |  Inloggen
```

**Login-knop:** Verander "Inloggen" naar:
```
Mijn dashboard →
```
(Geeft het gevoel dat er al iets op hen wacht — verlaagt drempel)

**Extra:** Voeg rechts van het logo toe (klein, subtiel):
```
⭐ 4.9 — 500+ winkeliers geholpen
```

---

## SECTIE 2 — HERO (FloorPlanExperience)

### Huidig probleem
- Geen zichtbare headline boven de vouw
- Abstracte plattegrond-animatie — te "techy"
- Zone-labels zoals "01 — INGANG" en "04 — HOTSPOTS & DODE ZONES" zijn jargon
- Body-teksten gebruiken "decompressiezone" — dat kent geen enkele kapper

### Verbeterde versie

#### HEADLINE (groot, boven de vouw)
**Huidig:** *(geen zichtbare headline)*

**Nieuw:**
```
Meer klanten.
Meer omzet.
Uw winkel werkt harder.
```
*Of simpeler:*
```
Ontdek waarom klanten
uw winkel verlaten
— en stop dat vandaag.
```

#### SUBHEADLINE
```
Upload een video van uw winkel. Onze AI laat u zien 
wat er mis gaat — en hoe u dat oplost. Resultaat binnen 1 uur.
```

#### CTA-KNOP (primair)
**Huidig:** "Start uw analyse"
**Nieuw:**
```
Bekijk hoe het werkt — gratis demo
```
*(Lagere drempel — vraagt nog geen €199)*

**Secundaire knop:**
```
Start nu voor €199 →
```

#### ZONE-TEKSTEN — Herschrijf alle 5

| Huidig | Nieuw |
|--------|-------|
| "01 — INGANG / AI ziet wat u mist bij de deur" | "Ingang / Zo beslissen klanten in 3 seconden of ze blijven" |
| "02 — LOOPROUTE / Uw klantenstroom, zichtbaar gemaakt" | "Looproute / Zien uw klanten uw beste producten wel?" |
| "03 — PRODUCTPLAATSING / Elk schap op de juiste plek" | "Schappen / Dit kleine verschil zorgt voor 40% meer aankopen" |
| "04 — HOTSPOTS & DODE ZONES / Van dode hoeken naar verkoopplekken" | "Dode hoeken / Plekken in uw winkel die nu geld kosten" |
| "05 — KASSA ZONE / Maximaliseer de laatste meters" | "Kassa / Verdien meer zonder één product toe te voegen" |

#### BODY-TEKSTEN — Herschrijf per zone

**Zone 1 (Ingang):**
*Huidig:* "Upload uw video en onze AI analyseert direct de decompressiezone..."
*Nieuw:*
```
Wist u dat de eerste 3 meter van uw winkel bepaalt of een klant 
blijft of omdraait? Wij laten u precies zien wat er beter kan 
— en hoe u dat morgen al kunt aanpakken.
```

**Zone 2 (Looproute):**
*Huidig:* "De AI brengt het looppad van uw klanten in kaart..."
*Nieuw:*
```
Klanten lopen altijd dezelfde route. Als uw beste producten 
op de "verkeerde" plek staan, zien ze die nooit. 
Wij tekenen de ideale route uit voor uw winkel.
```

**Zone 3 (Productplaatsing):**
*Huidig:* "Op basis van uw video-analyse genereert het platform een productplaatsingsplan..."
*Nieuw:*
```
Welk product op ooghoogte? Wat bij de ingang? 
Wat naast de kassa? U krijgt een kant-en-klaar plan 
dat u zelf kunt uitvoeren — dit weekend al.
```

**Zone 4 (Dode zones):**
*Huidig:* "De AI identificeert automatisch dode zones in uw winkel..."
*Nieuw:*
```
Bijna elke winkel heeft hoeken waar klanten nooit komen. 
Dat zijn gemiste verkopen. Wij laten u zien welke hoeken 
dat zijn en hoe u ze omtovert tot verkoopplekken.
```

**Zone 5 (Kassa):**
*Huidig:* "Het platform analyseert uw kassagebied en levert aanbevelingen voor impulseaankopen..."
*Nieuw:*
```
De laatste meter voor de kassa is de meest waardevolle plek 
in uw winkel. Wij laten u zien hoe u daar slim gebruik van maakt 
— gemiddeld +€8 per kassabon.
```

#### STAT-LABELS naast de zones
**Huidig:** "Analyse in minder dan 1 uur"
**Nieuw:** "✓ Resultaat vandaag nog" / "✓ U kunt het morgen uitvoeren"

#### VISUEEL ADVIES
De abstracte plattegrond is mooi maar niet herkenbaar voor winkeliers.

**Aanbeveling:** Voeg boven de plattegrond een kleine badge toe:
```
[📹 Loop 5 minuten door uw winkel] → [🤖 AI analyseert alles] → [📋 Plan klaar]
```

Overweeg om de plattegrond-animatie te vervangen door (of aan te vullen met) een echte winkelomgeving screenshot of illustratie — een herkenbare kapperszaak, boetiek of restaurant.

---

## SECTIE 3 — HOE HET WERKT (About)

### Huidig probleem
- Label "Hoe het werkt" is goed ✓
- Headline "Van video naar verbeterplan in 3 stappen" is goed ✓
- Stap-titels zijn duidelijk ✓
- Maar de stat "500+ analyses uitgevoerd" geloofwaardig genoeg?
- De floating card "€199 per analyse" verdwijnt in het design

### Verbeterde versie

**HEADLINE:** Behouden — werkt goed.

**STAP 1 — Titel:** "Upload uw video"
*Huidig body:* "Loop met uw telefoon door uw winkel en upload de video naar het platform. Geen speciale camera nodig, geen afspraak, geen wachttijd."
*Nieuw:*
```
Loop gewoon door uw winkel met uw telefoon. 
Geen dure camera, geen afspraak, geen gedoe. 
Duurt 5 minuten.
```

**STAP 2 — Titel:** Verander naar: "Wij analyseren alles voor u"
*Huidig body:* "Onze AI brengt de klantenstroom, productplaatsing en dode zones in kaart..."
*Nieuw:*
```
Onze software bekijkt uw video en ziet precies wat er beter kan. 
Waar lopen uw klanten? Welke producten worden overgeslagen? 
Waar verliest u omzet? Binnen 1 uur heeft u de antwoorden.
```

**STAP 3 — Titel:** "Voer het plan gewoon uit"
*Huidig body:* "U ontvangt een compleet vloerplan, productplaatsingsadvies en stap-voor-stap implementatieplan..."
*Nieuw:*
```
U krijgt een concreet stappenplan. Niet vaag advies, 
maar: "Zet schap B 2 meter naar links, plaats product X 
op ooghoogte." Gewoon uitvoeren — u heeft geen expert nodig.
```

**STATS — Herschrijf:**

| Huidig | Nieuw |
|--------|-------|
| €199 per analyse | Eenmalig €199 — geen maandelijkse kosten |
| 24 uur levertijd | Resultaat binnen 1 uur |
| 500+ analyses uitgevoerd | 500+ winkeliers geholpen |

**€199 floating card:** Maak prominenter:
```
Eenmalig €199
Geen abonnement. Geen verborgen kosten.
Niet tevreden? Geld terug.
```

---

## SECTIE 4 — DE TECHNOLOGIE (AI)

### Huidig probleem
**Kritiek probleem:** Het neuraal netwerk-diagram (INPUT → ANALYSE → PREDICT → OUTPUT) is het meest technische ding op de hele site. Een kapper snapt dit niet. Het wekt wantrouwen: "Dit is voor techneuten, niet voor mij."

De sectietitel "De technologie" sluit niemand aan.
"Computer vision die uw winkel begrijpt" is jargon.

### Verbeterde versie

**SECTIELABEL:** "De technologie" → **"Waarom het werkt"**

**HEADLINE:**
*Huidig:* "Computer vision die uw winkel begrijpt"
*Nieuw:*
```
Hetzelfde systeem dat grote winkelketens gebruiken
— nu voor uw winkel.
```

**SUBTITLE:**
*Huidig:* "Ons platform gebruikt dezelfde AI-technologie als grote retailers — maar dan toegankelijk voor elke winkelier."
*Nieuw:*
```
Grote ketens zoals H&M en IKEA betalen tienduizenden euro's 
voor winkellayout-onderzoek. Wij doen hetzelfde voor €199. 
Zonder gedoe. Zonder consultants.
```

**FEATURE-KAARTEN — Herschrijf titels en beschrijvingen:**

| Huidig titel | Nieuw titel | Huidig body | Nieuw body |
|---|---|---|---|
| "Video-analyse" | "Uw video, onze analyse" | "Upload een video met uw smartphone. Onze computer vision herkent schappen..." | "U filmt, wij analyseren. Geen speciale kennis nodig — als u een video kunt opnemen, kunt u dit gebruiken." |
| "Klantenstroom-mapping" | "Zien waar uw klanten lopen" | "De AI simuleert hoe klanten door uw winkel bewegen..." | "Wij laten zien welk pad uw klanten lopen en welke producten ze daardoor missen." |
| "Slim vloerplan" | "Een plattegrond die klopt" | "Het platform genereert een geoptimaliseerd vloerplan..." | "U ontvangt een tekening van uw winkel zoals die het beste werkt. Concreet en uitvoerbaar." |
| "Implementatieplan" | "Precies zeggen wat u moet doen" | "Geen vaag advies maar een stap-voor-stap plan..." | "Geen vaag advies. U krijgt een lijst: dit schaft u aan, dit verplaatst u, dit doet u als eerste." |

**STAT-BADGES:**

| Huidig | Nieuw |
|--------|-------|
| "Werkt met elke smartphone" | "✓ Gewoon uw telefoon" |
| "Gebaseerd op 10.000+ winkelpatronen" | "✓ Getest in 10.000+ winkels" |
| "Binnen 1 uur in uw dashboard" | "✓ Resultaat: nog vandaag" |
| "Concreet en direct toepasbaar" | "✓ Voer het zelf uit" |

**VISUEEL ADVIES:**
Vervang het neuraal netwerk-diagram door één van deze opties:
1. **Before/after illustratie** — links: warme kleur (druk gebied), rechts: koele kleur (dode zone). Simpel en herkenbaar.
2. **3-stappen iconen** — 📱 Filmen → 🔍 Analyseren → 📋 Plan — groot en simpel.
3. **Echte screenshot** van het dashboard — toont wat de klant echt krijgt.

---

## SECTIE 5 — CTA / PRIJZEN

### Huidig probleem
- Sectielabel "Start vandaag" is goed ✓
- Headline "Uw winkelanalyse voor €199" is helder ✓
- Maar de checklist-items zijn product-features, geen voordelen
- "Klantenstroom-optimalisatie" — jargon
- "Heatmap van uw winkel" — wat is een heatmap voor een kapper?
- Button "Start uw analyse" is functioneel maar niet motiverend
- "Bekijk live demo" is verstopt

### Verbeterde versie

**HEADLINE:** Behouden — duidelijk en concreet. ✓

**SUBTITLE:**
*Huidig:* "Upload een video, ontvang binnen 1 uur uw persoonlijke optimalisatieplan..."
*Nieuw:*
```
U filmt uw winkel. Wij vertellen u precies wat er beter kan 
en hoe u dat aanpakt. Eenmalig. Geen abonnement. Geen verrassingen.
```

**CHECKLIST — Herschrijf naar voordelen:**

| Huidig (feature) | Nieuw (voordeel) |
|---|---|
| Compleet vloerplan op maat | Een duidelijke tekening hoe uw winkel het beste werkt |
| Productplaatsingsadvies | Precies waar u elk product neerzet voor de meeste verkoop |
| Klantenstroom-optimalisatie | Hoe u ervoor zorgt dat klanten meer van uw winkel zien |
| Heatmap van uw winkel | Welke plekken geld kosten (en hoe u dat oplost) |
| Stap-voor-stap implementatieplan | Een concrete to-do lijst — u kunt er direct mee beginnen |
| Toegang tot persoonlijk dashboard | Alles op één plek — altijd terug te lezen |

**CTA-KNOP:**
*Huidig:* "Start uw analyse →"
*Nieuw:*
```
Meer klanten in mijn winkel →
```
*Of:*
```
Ik wil weten wat beter kan →
```

**DEMO-LINK:**
*Huidig:* "Bekijk live demo →" (te klein, verstopt)
*Nieuw — prominenter plaatsen:*
```
[Bekijk eerst een voorbeeld-analyse — gratis]
```
Maak dit een echte button (secundair, outline-stijl), BOVEN de primaire CTA.

**ONDERAAN DE KNOP:**
*Huidig:* "Resultaat binnen 1 uur · Geen abonnement"
*Nieuw:*
```
✓ Resultaat vandaag nog  ✓ Eenmalig betalen  ✓ Niet tevreden? Geld terug.
```

**CONTACTREGEL ONDERAAN:**
Voeg toe (als die er nog niet is):
```
Vragen? Mail ons: info@smartzones.nl — we reageren binnen 2 uur.
```

---

## SECTIE 6 — TRUST / SOCIAL PROOF (ontbreekt nu)

### Huidig probleem
Er zijn geen testimonials, geen klantnamen, geen "gebruikt door"-logos, geen foto's van echte winkeliers. Voor een lokale winkelier die €199 uitgeeft is dit een grote drempel.

### Aanbevelingen — waar in te voegen

**Plek 1: Direct onder de hero**
Voeg een simpele balk toe:
```
"Mijn omzet steeg met 23% na de analyse." — Fatima, eigenaar Brasserie de Hoek, Rotterdam
"In één weekend mijn winkel omgegooid. Best €199 die ik ooit uitgeef." — Mark, fietsenwinkel Amsterdam
"Ik dacht dat ik alles wist van mijn salon. Bleek ik het mis te hebben." — Sandra, kapsalon Utrecht
```

**Plek 2: Naast/onder de CTA-knop**
```
⭐⭐⭐⭐⭐ "Binnen 1 uur wist ik al wat ik moest veranderen."
— Karin, eigenaar boetiek Eindhoven
```

**Plek 3: In de "Hoe het werkt" sectie**
Voeg een kleine klantfoto + quote toe:
```
[Foto kapper] "Ik filmde op maandag, dinsdag had ik mijn plan. 
Woensdag had ik alles anders ingericht." 
— Ahmed, kapsalon Den Haag
```

**Credibility-badge** (rechtsboven in de pricing card):
```
🔒 Veilig betalen via Mollie  ·  iDEAL beschikbaar
```

---

## SECTIE 7 — LAYOUT VOLGORDE (beste volgorde voor conversie)

### Huidige volgorde
1. Hero (plattegrond + zones)
2. Hoe het werkt
3. De technologie
4. CTA / Prijzen

### Aanbevolen volgorde
1. **Hero** — Direct belofte + CTA
2. **Social proof balk** — 3 quotes, 1 regel elk *(nieuw in te voegen)*
3. **Hoe het werkt** — 3 stappen, simpel
4. **Wat u krijgt** — checklist met voordelen (huidige CTA-sectie, zonder de knop)
5. **Waarom het werkt** — technologie (korter, zonder neuraal netwerk)
6. **Prijzen + CTA** — met prominente knop + geld-terug garantie
7. **FAQ** *(eventueel nieuw)* — "Werkt dit ook voor mijn type winkel?"

---

## KLEUR & TYPOGRAFIE ADVIES

### Kleuren
**Huidig:** Donker (bijna zwart) achtergrond, oranje accent — voelt professioneel maar ook koud en "techy".

**Aanbeveling:**
- Behoud het donkere thema (het onderscheidt) ✓
- Voeg **meer warmte** toe: gebruik het oranje (#E87A2E) vaker voor positieve elementen
- Voeg een subtiel **warm wit** toe voor bodytekst (nu iets te blauwgrijs)
- **Accenten:** groen (#34A853) voor checkmarks en garanties — associatie met vertrouwen

### Typografie
**Huidig:** Plus Jakarta Sans (vetgedrukt, breed) voor headings — goed gekozen ✓

**Aanbeveling:**
- Headings: groter en dikker op mobile — winkeliers lezen op telefoon
- Body: letter-spacing iets verlagen op mobiel voor leesbaarheid
- Gebruik meer witruimte tussen paragrafen — minder muur van tekst

### Spacing
- Reduceer de "technologie"-sectie met 40% — minder tekst, meer witruimte
- Vergroot de CTA-knop op mobile (min. 54px hoog, volle breedte)
- Vergroot de step-nummers in "Hoe het werkt" (ze verdwijnen nu)

### Iconen vs Foto's
**Huidig:** Abstracte SVG-plattegrond en neuraal netwerk

**Aanbeveling:**
- Voeg 3 simpele iconen toe bij de 3 stappen: 📱 🔍 📋
- Vervang het neuraal netwerk door: een before/after screenshot van het dashboard
- Overweeg een echte foto boven de vouw: een herkenbare lokale winkel (kapper, boetiek)

---

## TOP 5 PRIORITEITEN — Implementeer dit eerst

1. **Voeg een zichtbare headline toe in de hero** — "Meer klanten in uw winkel. Al voor €199."
2. **Verwijder/vervang het neuraal netwerk-diagram** door iets begrijpelijks
3. **Herschrijf de checklist** van features naar voordelen
4. **Verander de CTA-knop** naar "Meer klanten in mijn winkel →"
5. **Voeg 2–3 echte quotes toe** van winkeliers — direct na de hero

---

*Rapport gegenereerd: april 2026 | Versie 1.0*
