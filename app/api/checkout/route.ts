import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

function getMollie() {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error('MOLLIE_API_KEY niet geconfigureerd');
  return createMollieClient({ apiKey: key });
}

/**
 * POST /api/checkout
 * Body: { analysisId: string }
 *
 * Maakt een Mollie betaling aan voor €199.
 * Geeft { url } terug om de gebruiker naar Mollie te sturen.
 * Mollie stuurt daarna een webhook naar /api/webhooks/mollie.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getSupabaseServer();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { analysisId } = await request.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId verplicht' }, { status: 400 });
    }

    const mollie = getMollie();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartzones.nl';

    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: '199.00' },
      description: `SmartZones winkelanalyse — ${analysisId}`,
      redirectUrl: `${origin}/dashboard/analysis/${analysisId}?betaald=1`,
      cancelUrl: `${origin}/dashboard/upload?geannuleerd=1`,
      webhookUrl: `${origin}/api/webhooks/mollie`,
      locale: 'nl_NL',
      metadata: {
        analysisId,
        userEmail: user.email || '',
      },
    });

    // Sla de Mollie payment ID op zodat de webhook hem kan terugvinden
    const { supabase } = await import('@/lib/supabase');
    await supabase
      .from('analyses')
      .update({ mollie_payment_id: payment.id })
      .eq('id', analysisId);

    return NextResponse.json({ url: payment.getCheckoutUrl() });
  } catch (err) {
    console.error('[Checkout] Fout:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout mislukt' },
      { status: 500 },
    );
  }
}
