import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/storage/signed-upload
 * Body: { path: string, bucket: string }
 *
 * Generates a signed upload URL so the browser can upload directly
 * to a private Supabase Storage bucket without exposing the service key.
 */
export async function POST(request: NextRequest) {
  // Verify auth
  const supabaseUser = await getSupabaseServer();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const { path, bucket } = await request.json();
  if (!path || !bucket) {
    return NextResponse.json({ error: 'path en bucket zijn verplicht' }, { status: 400 });
  }

  // Only allow uploads to the videos bucket, and only to paths starting with analysisId
  if (!['videos'].includes(bucket)) {
    return NextResponse.json({ error: 'Bucket niet toegestaan' }, { status: 403 });
  }

  // Generate signed URL using the service role client (has full access)
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error('[SignedUpload] Error:', error);
    return NextResponse.json({ error: 'Kon geen upload URL aanmaken' }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
  });
}
