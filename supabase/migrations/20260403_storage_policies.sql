-- Drop old anonymous policies if they exist (from previous migration version)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role all" ON storage.objects;

-- ============================================================
-- Storage policies — authenticated users only
-- ============================================================

-- VIDEOS bucket: authenticated users can upload their own folder
CREATE POLICY "Auth users can upload videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid() IS NOT NULL
  );

-- VIDEOS bucket: authenticated users can read (for frame extraction)
CREATE POLICY "Auth users can read videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'videos');

-- VISUALS bucket: authenticated users can read their visual guides
CREATE POLICY "Auth users can read visuals" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'visuals');

-- Service role: full access to both buckets (for server-side operations)
CREATE POLICY "Service role videos" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'videos');

CREATE POLICY "Service role visuals" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'visuals');

-- Allow authenticated users to read from visuals bucket
-- (for signed URL generation by service role — no direct anon access)
CREATE POLICY "Auth users can read visuals" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'visuals');

-- NOTE: The 'videos' bucket is used for BOTH videos and frames.
-- There is no separate 'frames' bucket needed.
