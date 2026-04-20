import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * GET  — fetch all tone configurations
 * POST — create a new tone
 * PATCH — update a tone (set default, edit fields)
 * DELETE — remove a non-default tone
 */

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tone_config')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tones: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, system_prompt_prefix } = body;

    if (!name || !system_prompt_prefix) {
      return NextResponse.json(
        { error: 'Naam en systeemprompt zijn verplicht' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('tone_config')
      .insert({
        name,
        description: description || null,
        system_prompt_prefix,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tone: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_default, name, description, system_prompt_prefix } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 });
    }

    // If setting as default, unset all others first
    if (is_default === true) {
      await supabase
        .from('tone_config')
        .update({ is_default: false })
        .neq('id', id);
    }

    const updateData: Record<string, unknown> = {};
    if (is_default !== undefined) updateData.is_default = is_default;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (system_prompt_prefix !== undefined) updateData.system_prompt_prefix = system_prompt_prefix;

    const { data, error } = await supabase
      .from('tone_config')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tone: data });
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

    // Prevent deleting the default tone
    const { data: tone } = await supabase
      .from('tone_config')
      .select('is_default')
      .eq('id', id)
      .single();

    if ((tone as { is_default: boolean } | null)?.is_default) {
      return NextResponse.json(
        { error: 'De standaard tone kan niet worden verwijderd. Stel eerst een andere tone in als standaard.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('tone_config')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
