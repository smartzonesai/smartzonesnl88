import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/invoices
 * Admin-only: returns all paid/pending analyses as invoice records.
 * Protected by Basic Auth via middleware.
 */
export async function GET() {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, store_name, store_type, status, created_at, paid, paid_at, mollie_payment_id, user_email')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const invoices = (data || []).map((row, i) => {
    const year = new Date(row.created_at).getFullYear();
    const seq = String(i + 1).padStart(3, '0');
    const paymentRef = row.mollie_payment_id?.slice(-6).toUpperCase() || seq;

    return {
      id: row.id,
      factuurNr: `SZ-${year}-${paymentRef}`,
      client: row.user_email.split('@')[0],
      email: row.user_email,
      store_name: row.store_name,
      amount: 199,
      status: row.paid ? 'paid' : (row.status === 'failed' ? 'failed' : 'pending'),
      date: row.paid_at || row.created_at,
      mollie_payment_id: row.mollie_payment_id || null,
    };
  });

  return NextResponse.json(invoices);
}
