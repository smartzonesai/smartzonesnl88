import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getMollie() {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error('MOLLIE_API_KEY niet geconfigureerd');
  return createMollieClient({ apiKey: key });
}

/**
 * POST /api/webhooks/mollie
 *
 * Mollie stuurt een POST met { id: 'tr_...' } zodra een betaling van status verandert.
 * We halen de betaling op bij Mollie om de echte status te verifiëren.
 *
 * Configureer in Mollie dashboard: https://smartzones.nl/api/webhooks/mollie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const paymentId = params.get('id');

    if (!paymentId) {
      // Mollie stuurt soms een lege test-ping — stilletjes 200 teruggeven
      return NextResponse.json({ ok: true });
    }

    // Haal de betaling op bij Mollie om status te verifiëren (nooit vertrouwen op de webhook body)
    const mollie = getMollie();
    const payment = await mollie.payments.get(paymentId);

    // Zoek de bijbehorende analyse op via mollie_payment_id
    const { data: analysis } = await supabase
      .from('analyses')
      .select('id, user_email, status, paid')
      .eq('mollie_payment_id', paymentId)
      .single();

    if (!analysis) {
      console.error(`[Mollie Webhook] Geen analyse gevonden voor payment ${paymentId}`);
      return NextResponse.json({ ok: true }); // 200 zodat Mollie niet opnieuw probeert
    }

    if (payment.status === 'paid' && !analysis.paid) {
      console.log(`[Mollie Webhook] Betaling geslaagd voor analyse ${analysis.id}`);

      // 1. Markeer analyse als betaald
      await supabase
        .from('analyses')
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          status: 'processing',
        })
        .eq('id', analysis.id);

      // 2. Start de AI-analyse (fire and forget)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://smartzones.nl');

      fetch(`${siteUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-cron': process.env.CRON_SECRET || '',
        },
        body: JSON.stringify({ analysisId: analysis.id }),
      }).catch((err) => console.error('[Mollie Webhook] Analyse starten mislukt:', err));

      // 3. Stuur bevestigingsmail met factuurinformatie
      const amount = payment.amount?.value ? `€${payment.amount.value}` : '€199,00';
      const amountExBtw = '€164,46'; // 199 / 1.21
      const btwBedrag = '€34,54';    // 199 - 164.46
      const factuurNr = `SZ-${new Date().getFullYear()}-${payment.id.slice(-6).toUpperCase()}`;
      const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

      await sendEmail({
        to: analysis.user_email,
        subject: `Betaling ontvangen — factuur ${factuurNr}`,
        body: `Geachte klant,

Bedankt voor uw betaling. Hieronder vindt u uw factuurgegevens.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTUUR ${factuurNr}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Datum: ${datum}
Betaalmethode: Mollie (${payment.method || 'online'})
Betalingsreferentie: ${payment.id}

Smart Zones B.V.
KvK: ${process.env.KVK_NUMMER || '[KvK-nummer invullen]'}
BTW: ${process.env.BTW_NUMMER || '[BTW-nummer invullen]'}
E-mail: info@smartzones.nl

OMSCHRIJVING
Winkelanalyse AI — ${analysis.store_name}
Eenmalige analyse incl. implementatieplan

Subtotaal (excl. BTW 21%): ${amountExBtw}
BTW (21%):                  ${btwBedrag}
Totaal (incl. BTW):        ${amount}

STATUS: BETAALD ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uw analyse wordt nu verwerkt. Dit duurt gemiddeld 15–45 minuten.
Volg de voortgang op: ${siteUrl}/dashboard/analysis/${analysis.id}

Met vriendelijke groet,
Het Smart Zones team`,
      });

    } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
      console.log(`[Mollie Webhook] Betaling ${payment.status} voor analyse ${analysis.id}`);
      // Zet status terug naar pending zodat de klant het opnieuw kan proberen
      await supabase
        .from('analyses')
        .update({ status: 'pending' })
        .eq('id', analysis.id)
        .eq('paid', false); // Alleen als nog niet betaald
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Mollie Webhook] Fout:', err);
    // Geef 200 terug — anders blijft Mollie hetzelfde webhook-verzoek herhalen
    return NextResponse.json({ ok: true });
  }
}
