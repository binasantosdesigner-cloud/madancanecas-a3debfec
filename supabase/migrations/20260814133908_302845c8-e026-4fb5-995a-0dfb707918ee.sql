ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

-- RLS para o novo bucket 'product-images' (o bucket é criado via ferramenta dedicada)
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Grant explícito para garantir acesso
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
GRANT SELECT ON TABLE public.products TO anon;