-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Usuário vê e gerencia apenas os próprios favoritos
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Admin lê todos (para campanhas)
CREATE POLICY "favorites_admin_read" ON public.favorites
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Adicionar campo de aceite de comunicação WhatsApp nos perfis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
