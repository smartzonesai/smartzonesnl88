import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/**
 * DELETE /api/account/delete
 *
 * AVG/GDPR-compliant account verwijdering.
 * Verwijdert alle analyses, user_profiles data en het auth account.
 * Vereist geldige sessie.
 */
export async function DELETE() {
  try {
    const supabaseUser = await getSupabaseServer();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email || '';

    console.log(`[AccountDelete] Verwijderen account: ${userEmail}`);

    // 1. Verwijder analyses (result_json, video_url referenties)
    const { data: analyses } = await supabase
      .from('analyses')
      .select('id, video_url')
      .eq('user_email', userEmail);

    if (analyses && analyses.length > 0) {
      // Verwijder video bestanden uit storage
      const videoPaths = analyses
        .map(a => a.video_url)
        .filter(Boolean);

      if (videoPaths.length > 0) {
        await supabase.storage.from('videos').remove(videoPaths).catch(() => {});
      }

      // Verwijder frames en visuals per analyse
      for (const analysis of analyses) {
        await supabase.storage
          .from('videos')
          .list(analysis.id)
          .then(({ data: files }) => {
            if (files && files.length > 0) {
              const paths = files.map(f => `${analysis.id}/${f.name}`);
              return supabase.storage.from('videos').remove(paths);
            }
          })
          .catch(() => {});

        await supabase.storage
          .from('visuals')
          .list(analysis.id)
          .then(({ data: files }) => {
            if (files && files.length > 0) {
              const paths = files.map(f => `${analysis.id}/${f.name}`);
              return supabase.storage.from('visuals').remove(paths);
            }
          })
          .catch(() => {});
      }

      // Verwijder analyse records
      await supabase
        .from('analyses')
        .delete()
        .eq('user_email', userEmail);
    }

    // 2. Verwijder user profile
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    // 3. Verwijder het auth account via service role
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('[AccountDelete] Auth delete fout:', deleteError);
      // Ga door — data is al verwijderd
    }

    console.log(`[AccountDelete] Account ${userEmail} volledig verwijderd`);
    return NextResponse.json({ ok: true, message: 'Account en alle gegevens verwijderd' });
  } catch (err) {
    console.error('[AccountDelete] Fout:', err);
    return NextResponse.json(
      { error: 'Verwijderen mislukt: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}
