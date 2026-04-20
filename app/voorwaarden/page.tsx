import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden — Smart Zones',
  description: 'Algemene voorwaarden van Smart Zones B.V.',
};

export default function Voorwaarden() {
  const section = (title: string, content: string) => (
    <section key={title} style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.125rem', fontWeight: 700, color: '#E8E4DC', marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ color: 'rgba(232,228,220,0.65)', fontSize: '0.9rem', lineHeight: 1.75 }}
        dangerouslySetInnerHTML={{ __html: content }} />
    </section>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#111110', padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#E8E4DC', marginBottom: '0.5rem' }}>
          Algemene Voorwaarden
        </h1>
        <p style={{ color: 'rgba(232,228,220,0.35)', fontSize: '0.85rem', marginBottom: '3rem' }}>
          Versie 1.0 — Laatste wijziging: april 2026
        </p>

        {section('1. Definities', `
          <p><strong>Smart Zones</strong>: Smart Zones B.V., gevestigd in Nederland, ingeschreven bij de Kamer van Koophandel.</p>
          <p><strong>Dienst</strong>: Het AI-gestuurde winkeloptimalisatieplatform, inclusief video-analyse, rapportage en dashboard.</p>
          <p><strong>Klant</strong>: De natuurlijke persoon of rechtspersoon die een overeenkomst aangaat met Smart Zones.</p>
          <p><strong>Analyse</strong>: Het door Smart Zones gegenereerde rapport op basis van door de Klant aangeleverde videobeelden.</p>
        `)}

        {section('2. Toepasselijkheid', `
          <p>Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, overeenkomsten en leveringen van Smart Zones. Afwijkingen zijn slechts geldig indien uitdrukkelijk schriftelijk overeengekomen.</p>
        `)}

        {section('3. Dienstverlening', `
          <p>Smart Zones biedt een eenmalige winkelanalyse aan voor €199 (excl. BTW). Na succesvolle betaling via Mollie wordt de analyse gestart. De doorlooptijd bedraagt gemiddeld 15–45 minuten. Smart Zones streeft naar een maximale doorlooptijd van 2 uur.</p>
          <p>De Klant ontvangt toegang tot het analyseresultaat via een persoonlijk dashboard voor onbeperkte duur.</p>
        `)}

        {section('4. Betaling', `
          <p>Betaling geschiedt vooraf via het Mollie-betaalplatform. Smart Zones accepteert iDEAL, creditcard en Bancontact. Na bevestiging van betaling door Mollie wordt de dienst gestart.</p>
          <p>Bij technische problemen waardoor de analyse niet kan worden voltooid, heeft de Klant recht op volledige terugbetaling.</p>
        `)}

        {section('5. Herroepingsrecht', `
          <p>Omdat de dienst na betaling direct digitaal wordt geleverd, vervalt het herroepingsrecht zodra de analyse is gestart. De Klant stemt hier uitdrukkelijk mee in bij het plaatsen van de bestelling, overeenkomstig artikel 6:230p sub f BW.</p>
        `)}

        {section('6. Aansprakelijkheid', `
          <p>Smart Zones is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst. De aansprakelijkheid is in alle gevallen beperkt tot het door de Klant betaalde bedrag voor de betreffende analyse.</p>
          <p>De resultaten van de analyse zijn gebaseerd op AI-interpretatie van aangeleverde beelden en zijn indicatief van aard. Smart Zones geeft geen garantie op specifieke omzetgroei.</p>
        `)}

        {section('7. Intellectueel eigendom', `
          <p>Alle door Smart Zones gegenereerde rapporten, analyses en visuele gidsen zijn eigendom van de Klant na volledige betaling. Smart Zones behoudt het recht geanonimiseerde data te gebruiken voor verbetering van de dienst.</p>
        `)}

        {section('8. Gegevensverwerking', `
          <p>Smart Zones verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG). Voor details zie onze <a href="/privacy" style="color:#E87A2E;">Privacyverklaring</a>. Videobeelden worden uitsluitend gebruikt voor de aangevraagde analyse en niet gedeeld met derden.</p>
        `)}

        {section('9. Toepasselijk recht', `
          <p>Op alle overeenkomsten met Smart Zones is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement waar Smart Zones is gevestigd.</p>
        `)}

        {section('10. Contactgegevens', `
          <p>Smart Zones B.V.<br/>
          E-mail: <a href="mailto:info@smartzones.nl" style="color:#E87A2E;">info@smartzones.nl</a><br/>
          Website: <a href="https://smartzones.nl" style="color:#E87A2E;">smartzones.nl</a></p>
        `)}
      </div>
    </div>
  );
}
