import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cookiebeleid</h1>
      <p className="mt-4 text-lg text-[var(--text-secondary,#555)]">
        Op deze pagina leggen wij uit welke cookies wij gebruiken, waarvoor ze dienen en hoe
        u uw voorkeuren kunt beheren.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Wat zijn cookies?</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u
          een website bezoekt. Ze helpen de website om uw voorkeuren te onthouden en het
          gebruik van de site te analyseren.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Welke cookies gebruiken wij</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 pr-4 text-left font-semibold">Type</th>
                <th className="py-3 pr-4 text-left font-semibold">Doel</th>
                <th className="py-3 text-left font-semibold">Bewaartermijn</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary,#555)]">
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium text-[var(--text-primary,#111)]">
                  Noodzakelijk
                </td>
                <td className="py-3 pr-4">
                  Essentieel voor de werking van de website, zoals het onthouden van uw
                  cookievoorkeuren en sessiegegevens.
                </td>
                <td className="py-3">Sessie / 1 jaar</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium text-[var(--text-primary,#111)]">
                  Analytisch
                </td>
                <td className="py-3 pr-4">
                  Helpen ons inzicht te krijgen in hoe bezoekers de website gebruiken, zodat
                  wij de ervaring kunnen verbeteren. Bijvoorbeeld Google Analytics.
                </td>
                <td className="py-3">Tot 26 maanden</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium text-[var(--text-primary,#111)]">
                  Marketing
                </td>
                <td className="py-3 pr-4">
                  Worden gebruikt om bezoekers op verschillende websites te volgen en
                  relevante advertenties te tonen.
                </td>
                <td className="py-3">Tot 12 maanden</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium text-[var(--text-primary,#111)]">
                  Functioneel
                </td>
                <td className="py-3 pr-4">
                  Maken verbeterde functionaliteit en personalisatie mogelijk, zoals
                  taalvoorkeuren of eerder ingevulde formuliergegevens.
                </td>
                <td className="py-3">Tot 12 maanden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Hoe kunt u cookies beheren?</h2>
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#555)]">
          U kunt uw cookievoorkeuren op elk moment aanpassen via de cookiebanner op onze
          website. Daarnaast kunt u cookies verwijderen of blokkeren via de instellingen van
          uw browser. Houd er rekening mee dat het uitschakelen van bepaalde cookies de
          werking van de website kan beinvloeden.
        </p>
      </section>

      <p className="mt-16 text-sm text-[var(--text-tertiary,#999)]">
        Dit cookiebeleid is voor het laatst bijgewerkt op 17 maart 2026.
      </p>
    </main>
  );
}
