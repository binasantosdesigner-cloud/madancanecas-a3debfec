-- Tabela de relacionamento produto → upsells
CREATE TABLE IF NOT EXISTS public.product_upsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upsell_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, upsell_product_id),
  CHECK (product_id <> upsell_product_id)
);

ALTER TABLE public.product_upsells ENABLE ROW LEVEL SECURITY;

-- Leitura pública (catálogo é público)
CREATE POLICY "upsells_public_read"
  ON public.product_upsells FOR SELECT
  TO anon, authenticated USING (true);

-- Apenas admin escreve
CREATE POLICY "upsells_admin_write"
  ON public.product_upsells FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.product_upsells TO anon, authenticated;
GRANT ALL ON public.product_upsells TO service_role;