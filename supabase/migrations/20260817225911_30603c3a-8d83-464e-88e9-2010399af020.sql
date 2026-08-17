CREATE TABLE IF NOT EXISTS public.help_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.help_topics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.help_topics TO authenticated;
GRANT ALL ON public.help_topics TO service_role;

ALTER TABLE public.help_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_topics_public_read"
  ON public.help_topics FOR SELECT
  TO anon, authenticated USING (active = true);

CREATE POLICY "help_topics_admin_all"
  ON public.help_topics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER help_topics_touch_updated_at
  BEFORE UPDATE ON public.help_topics
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.help_topics (title, content, display_order) VALUES
(
  'Política de Trocas e Devoluções',
  'Aceitamos solicitações de troca em até 7 dias corridos após o recebimento do produto nos seguintes casos:

- Produto chegou com defeito de fabricação (impressão borrada, peça danificada, item errado)
- Houve erro nosso no pedido (arte diferente da aprovada, produto trocado)
- O produto chegou avariado durante o transporte

Como solicitar: Entre em contato pelo WhatsApp informando o número do pedido, descrição do problema e foto do produto com o defeito. Analisaremos em até 2 dias úteis.

Não realizamos trocas por: arrependimento após produção, erros na arte aprovada pelo cliente, ou danos por mau uso.',
  1
),
(
  'Como cuidar dos produtos',
  'Canecas: Lave preferencialmente à mão com esponja macia. Não use esponja de aço ou produtos abrasivos. Se usar lava-louças, prefira ciclos suaves.

Camisetas: Lave ao avesso em água fria. Não use alvejante. Seque à sombra e passe ferro pelo avesso.

Garrafas e Copos Térmicos: Lave à mão — não vão ao lava-louças. Deixe secar com a tampa aberta.

Taças: Lave à mão com cuidado e seque imediatamente com pano seco.',
  2
),
(
  'Perguntas Frequentes',
  'Como faço um pedido?
Adicione produtos ao carrinho ou fale diretamente pelo WhatsApp. Nossa equipe cria um design exclusivo para aprovação antes da produção.

Qual o prazo de produção?
Em média 5 a 10 dias úteis após aprovação da arte.

Vocês entregam fora de Rondonópolis?
No momento fazemos entrega apenas em Rondonópolis-MT. Consulte pelo WhatsApp.

Quais formas de pagamento são aceitas?
PIX (50% antecipado + 50% na entrega).

Posso enviar minha própria arte?
Sim! Aceitamos PNG, JPG ou PDF em alta resolução (mín. 300 DPI).',
  3
),
(
  'Sobre a Madan',
  'A Madan nasceu da vontade de transformar objetos do dia a dia em memórias afetivas. Somos uma marca de Rondonópolis-MT especializada em presentes personalizados com arte exclusiva e acabamento premium.

Trabalhamos com canecas, camisetas, garrafas, taças, copos e muito mais — todos personalizados com atenção aos detalhes e embalados com cuidado especial.

Nossos diferenciais:
- Arte exclusiva criada especialmente para cada pedido
- Você aprova a arte antes de qualquer produção
- Embalagem especial em todos os pedidos
- Entrega pessoal em Rondonópolis-MT

WhatsApp: (66) 98426-6994
E-mail: madan.canecas@gmail.com
Instagram: @madancanecas',
  4
);