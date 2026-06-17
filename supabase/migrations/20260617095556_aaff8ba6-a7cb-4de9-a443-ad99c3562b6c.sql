
CREATE POLICY "art-approvals read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'art-approvals' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')
  ));
CREATE POLICY "art-approvals insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'art-approvals' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')
  ));
CREATE POLICY "art-approvals update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'art-approvals' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')
  ));
CREATE POLICY "art-approvals delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'art-approvals' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')
  ));
