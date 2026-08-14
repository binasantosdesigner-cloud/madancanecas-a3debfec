
-- 1. Adicionar campos de pagamento na tabela orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  ADD COLUMN IF NOT EXISTS amount_due NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_confirmed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- 2. Permitir que o cliente atualize payment_status não — só admin
-- (policy existente orders_admin_update já cobre isso)

-- 3. Inserir configurações PIX na tabela settings
INSERT INTO public.settings (key, value) VALUES
  ('pix_key',        '46960905000104'),
  ('pix_key_type',   'cnpj'),
  ('pix_beneficiary','ELMADAN QUEIROZ SILVEIRA BENITES'),
  ('pix_city',       'Rondonopolis'),
  ('pix_percent_due', '50')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Inserir CNPJ nas configurações gerais
INSERT INTO public.settings (key, value) VALUES
  ('cnpj', '46.960.905/0001-04')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
