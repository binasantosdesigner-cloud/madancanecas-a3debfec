-- Adicionar campos de destaque e imagem nas categorias
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Marcar as 6 primeiras categorias como destaque por padrão
UPDATE public.categories
SET featured = true
WHERE slug IN (
  'canecas', 'camisetas', 'copos-e-garrafas',
  'tacas', 'chaveiros', 'almofadas-e-toalhas'
);

-- Política de leitura pública para imagens de categorias
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'categories_images_public_read'
    ) THEN
        CREATE POLICY "categories_images_public_read"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'categories');
    END IF;
END $$;

-- Admin pode fazer upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'categories_images_admin_upload'
    ) THEN
        CREATE POLICY "categories_images_admin_upload"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'categories'
          AND public.has_role(auth.uid(), 'admin')
        );
    END IF;
END $$;

-- Admin pode deletar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'categories_images_admin_delete'
    ) THEN
        CREATE POLICY "categories_images_admin_delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'categories'
          AND public.has_role(auth.uid(), 'admin')
        );
    END IF;
END $$;
