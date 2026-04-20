import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET — fetch all A/B tests with stats
export async function GET() {
  const { data: tests, error } = await supabase
    .from('ab_tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Calculate stats for each test
  const enriched = await Promise.all(
    (tests || []).map(async (test) => {
      const { data: logs } = await supabase
        .from('email_log')
        .select('variant, status')
        .eq('ab_test_id', test.id);

      const variantA = (logs || []).filter(l => l.variant === 'A');
      const variantB = (logs || []).filter(l => l.variant === 'B');

      return {
        ...test,
        stats: {
          a: {
            sent: variantA.length,
            opened: variantA.filter(l => ['opened', 'clicked'].includes(l.status)).length,
            clicked: variantA.filter(l => l.status === 'clicked').length,
          },
          b: {
            sent: variantB.length,
            opened: variantB.filter(l => ['opened', 'clicked'].includes(l.status)).length,
            clicked: variantB.filter(l => l.status === 'clicked').length,
          },
        },
      };
    })
  );

  return NextResponse.json(enriched);
}

// POST — create a new A/B test
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('ab_tests')
    .insert({
      name: body.name,
      variant_a_subject: body.variant_a_subject,
      variant_a_body: body.variant_a_body,
      variant_b_subject: body.variant_b_subject,
      variant_b_body: body.variant_b_body,
      status: 'active',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH — update test status (complete/pause)
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  if (!id) return NextResponse.json({ error: 'id verplicht' }, { status: 400 });

  const { error } = await supabase
    .from('ab_tests')
    .update({ status })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remove a test
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) return NextResponse.json({ error: 'id verplicht' }, { status: 400 });

  const { error } = await supabase.from('ab_tests').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
