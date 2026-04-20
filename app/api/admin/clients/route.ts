import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/clients
 * Admin-only: returns all unique clients grouped by email.
 */
export async function GET() {
  const { data, error } = await supabase
    .from('analyses')
    .select('user_email, store_name, store_type, status, created_at, paid')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by email
  const clientMap = new Map<string, {
    email: string;
    store_name: string;
    store_type: string;
    analyses: number;
    completed: number;
    total_spent: number;
    last_active: string;
    first_seen: string;
  }>();

  for (const row of data || []) {
    const existing = clientMap.get(row.user_email);
    if (!existing) {
      clientMap.set(row.user_email, {
        email: row.user_email,
        store_name: row.store_name,
        store_type: row.store_type,
        analyses: 1,
        completed: row.status === 'complete' ? 1 : 0,
        total_spent: row.paid ? 199 : 0,
        last_active: row.created_at,
        first_seen: row.created_at,
      });
    } else {
      existing.analyses++;
      if (row.status === 'complete') existing.completed++;
      if (row.paid) existing.total_spent += 199;
      if (row.created_at > existing.last_active) existing.last_active = row.created_at;
      if (row.created_at < existing.first_seen) existing.first_seen = row.created_at;
    }
  }

  const clients = Array.from(clientMap.values())
    .sort((a, b) => b.last_active.localeCompare(a.last_active));

  return NextResponse.json(clients);
}
