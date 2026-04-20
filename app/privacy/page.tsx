import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacybeleid</h1>
      <p className="mt-4 text-lg text-[var(--text-secondary,#555)]">
        Smart Zones hecht veel waarde aan de bescherming van uw persoonsgegevens. In dit
        privacybeleid leggen wij uit welke gegevens wij verzamelen, waarom wij dat doen en
        welke rechten u heeft.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">1. Welke gegevens verzamelen wij</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          Wij kunnen de volgende persoonsgegevens verzamelen wanneer u onze website bezoekt
          of contact met ons opneemt: naam, e-mailadres, telefoonnummer, bedrijfsnaam en
          gegevens over uw websitegebruik (via cookies).
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">2. Waarom verzamelen wij deze gegevens</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          Wij gebruiken uw gegevens om uw vraag te beantwoorden, onze dienstverlening te
          verbeteren, u relevante informatie te sturen en het gebruik van onze website te
          analyseren.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">3. Hoe lang bewaren wij uw gegevens</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          Wij bewaren uw persoonsgegevens niet langer dan strikt noodzakelijk is voor de
          doeleinden waarvoor zij zijn verzameld. In de regel hanteren wij een bewaartermijn
          van maximaal 24 maanden na het laatste contact.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">4. Uw rechten</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te
          verwijderen. Daarnaast heeft u het recht om uw toestemming voor de
          gegevensverwerking in te trekken of bezwaar te maken tegen de verwerking van uw
          gegevens. Neem hiervoor contact met ons op.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">5. Contact</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          Heeft u vragen over dit privacybeleid of over de verwerking van uw
          persoonsgegevens? Neem dan gerust contact met ons op via het contactformulier op
          onze website of stuur een e-mail naar ons kantoor.
        </p>
      </section>

      <p className="mt-16 text-sm text-[var(--text-tertiary,#999)]">
        Dit privacybeleid is voor het laatst bijgewerkt op 17 maart 2026.
      </p>
    </main>
  );
}
