
-- 1. Customizations bucket: enforce per-user folder on upload
DROP POLICY IF EXISTS customizations_auth_upload ON storage.objects;
CREATE POLICY customizations_auth_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'customizations'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Remove broad SELECT (listing) policies on public buckets.
-- Public URLs still serve files directly; only list/search APIs are restricted.
DROP POLICY IF EXISTS customizations_public_read ON storage.objects;
DROP POLICY IF EXISTS products_bucket_public_read ON storage.objects;

-- 3. Restrict settings table public reads to the whatsapp_number key only
DROP POLICY IF EXISTS settings_public_read ON public.settings;
CREATE POLICY settings_public_read ON public.settings
  FOR SELECT TO anon, authenticated
  USING (key = 'whatsapp_number');

-- 4. Revoke has_role execute from anon (kept for authenticated, required by RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
