import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { clearAnthropicClientCache } from '@/lib/anthropic';

export const runtime = 'nodejs';

/**
 * GET  — fetch current Anthropic API key config (masked)
 * POST — save + verify a new API key
 * DELETE — remove the API key
 */

function maskKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return key.slice(0, 7) + '•••' + key.slice(-4);
}

async function verifyAnthropicKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Respond with OK' }],
    });
    return { valid: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, error: message };
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('provider', 'anthropic')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        id: data.id,
        provider: data.provider,
        masked_key: data.encrypted_key ? maskKey(data.encrypted_key) : null,
        is_active: data.is_active,
        verification_status: data.verification_status,
        last_verified_at: data.last_verified_at,
        created_at: data.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'API-sleutel is verplicht' },
        { status: 400 },
      );
    }

    if (!key.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'Ongeldige sleutel-indeling. Een Anthropic-sleutel begint met sk-ant-' },
        { status: 400 },
      );
    }

    // Verify the key works
    const verification = await verifyAnthropicKey(key);

    const now = new Date().toISOString();
    const verificationStatus = verification.valid ? 'valid' : 'invalid';

    // Check if a record already exists
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id')
      .eq('provider', 'anthropic')
      .single();

    let data;
    let error;

    if (existing) {
      // Update existing record
      const result = await supabase
        .from('api_keys')
        .update({
          encrypted_key: key,
          is_active: verification.valid,
          verification_status: verificationStatus,
          last_verified_at: now,
        })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('api_keys')
        .insert({
          provider: 'anthropic',
          user_email: 'admin',
          key_hash: key.slice(-8),
          name: 'Anthropic API Key',
          encrypted_key: key,
          is_active: verification.valid,
          verification_status: verificationStatus,
          last_verified_at: now,
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear cached Anthropic client so next call uses the new key
    clearAnthropicClientCache();

    return NextResponse.json({
      config: {
        id: data.id,
        provider: data.provider,
        masked_key: maskKey(key),
        is_active: data.is_active,
        verification_status: data.verification_status,
        last_verified_at: data.last_verified_at,
        created_at: data.created_at,
      },
      verification: {
        valid: verification.valid,
        error: verification.error || null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 });
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear cached client so system falls back to env var
    clearAnthropicClientCache();

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
