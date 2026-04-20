import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function getMollie() {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error('MOLLIE_API_KEY niet geconfigureerd');
  return createMollieClient({ apiKey: key });
}

/**
 * POST /api/admin/refund
 * Body: { analysisId: string, reason?: string }
 *
 * Verwerkt een terugbetaling via Mollie en zet analyse status op 'refunded'.
 * Admin-only — beschermd via Basic Auth in middleware.
 */
export async function POST(request: NextRequest) {
  try {
    const { analysisId, reason } = await request.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId verplicht' }, { status: 400 });
    }

    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('id, mollie_payment_id, paid, store_name, user_email')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'Analyse niet gevonden' }, { status: 404 });
    }

    if (!analysis.paid) {
      return NextResponse.json({ error: 'Analyse is niet betaald — geen terugbetaling mogelijk' }, { status: 400 });
    }

    if (!analysis.mollie_payment_id) {
      return NextResponse.json({
        error: 'Geen Mollie payment ID — verwerk handmatig via Mollie dashboard',
        mollieUrl: 'https://www.mollie.com/dashboard/payments',
      }, { status: 400 });
    }

    const mollie = getMollie();
    const refund = await mollie.paymentRefunds.create({
      paymentId: analysis.mollie_payment_id,
      amount: { currency: 'EUR', value: '199.00' },
      description: reason || `Terugbetaling winkelanalyse ${analysis.store_name}`,
    });

    await supabase
      .from('analyses')
      .update({ paid: false })
      .eq('id', analysisId);

    console.log(`[Refund] Terugbetaling ${refund.id} voor analyse ${analysisId}`);

    return NextResponse.json({
      ok: true,
      refundId: refund.id,
      status: refund.status,
      message: `Terugbetaling van €199 ingediend (ID: ${refund.id}). Verwerking duurt 3–5 werkdagen.`,
    });
  } catch (err) {
    console.error('[Refund] Fout:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Terugbetaling mislukt' },
      { status: 500 },
    );
  }
}
