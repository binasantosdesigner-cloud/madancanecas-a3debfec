ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

CREATE OR REPLACE VIEW public.categories_tree
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.image_url,
  c.featured,
  c.display_order,
  c.parent_id,
  p.name AS parent_name,
  p.slug AS parent_slug
FROM public.categories c
LEFT JOIN public.categories p ON p.id = c.parent_id;

GRANT SELECT ON public.categories_tree TO anon, authenticated;