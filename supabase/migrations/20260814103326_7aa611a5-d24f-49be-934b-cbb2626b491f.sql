
-- 1. Inserir Categorias faltantes
INSERT INTO public.categories (name, slug, display_order)
VALUES 
  ('Camisetas', 'camisetas', 2),
  ('Copos e Garrafas', 'copos-e-garrafas', 3),
  ('Taças', 'tacas', 4),
  ('Chaveiros', 'chaveiros', 5),
  ('Agendas e Blocos', 'agendas-e-blo-cos', 6),
  ('Azulejo e Relógio', 'azulejo-e-relogio', 7),
  ('Almofada e Toalhas', 'almofada-e-toalhas', 8),
  ('Outros', 'outros', 9)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Inserir Produtos
INSERT INTO public.products (title, slug, price, category_id, kind, active, description)
SELECT p.title, p.slug, p.price, c.id, 'custom', true, p.description
FROM (VALUES
  ('Caneca Branca Porcelana', 'caneca-branca-porcelana', 35.00, 'canecas', 'Caneca clássica de porcelana branca.'),
  ('Caneca Colorida', 'caneca-colorida', 45.00, 'canecas', 'Caneca com interior e alça coloridos.'),
  ('Caneca Colorida Coração', 'caneca-colorida-coracao', 49.90, 'canecas', 'Caneca romântica com alça de coração.'),
  ('Caneca Preta', 'caneca-preta', 49.00, 'canecas', 'Caneca preta elegante.'),
  ('Caneca Mágica', 'caneca-magica', 55.00, 'canecas', 'Revela a imagem quando recebe líquido quente.'),
  ('Caneca com Colher', 'caneca-com-colher', 55.00, 'canecas', 'Acompanha colher de porcelana.'),
  ('Caneca Mármore', 'caneca-marmore', 55.00, 'canecas', 'Textura marmorizada premium.'),
  ('Caneca com Glitter', 'caneca-com-glitter', 54.90, 'canecas', 'Acabamento brilhante e festivo.'),
  ('Caneca de Porcelana Neon Rosa', 'caneca-de-porcelana-neon-rosa', 55.00, 'canecas', 'Cor vibrante neon.'),
  ('Caneca de Chopp — Vidro', 'caneca-de-chopp-vidro', 68.00, 'canecas', 'Ideal para festas e eventos.'),
  ('Caneca de Chopp — Alumínio', 'caneca-de-chopp-aluminio', 32.00, 'canecas', 'Resistente e clássica.'),
  ('Caneca de Chopp — Acrílico', 'caneca-de-chopp-acrilico', 12.50, 'canecas', 'Leve e prática.'),
  ('Torre de Xícaras (2 un.)', 'torre-de-xicaras-2-un', 88.00, 'canecas', 'Conjunto decorativo e funcional.'),
  ('Torre de Xícaras (4 un.)', 'torre-de-xicaras-4-un', 149.00, 'canecas', 'Conjunto familiar completo.'),
  -- Camisetas
  ('Camiseta Adulto Unissex', 'camiseta-adulto-unissex', 45.00, 'camisetas', 'Algodão de alta qualidade.'),
  ('Camiseta Infantil', 'camiseta-infantil', 40.00, 'camisetas', 'Conforto para os pequenos.'),
  ('Baby Look', 'baby-look', 45.00, 'camisetas', 'Corte feminino ajustado.'),
  -- Copos e Garrafas
  ('Copo Long Drink', 'copo-long-drink', 8.00, 'copos-e-garrafas', 'Perfeito para coquetéis.'),
  ('Copo Térmico Inox', 'copo-termico-inox', 75.00, 'copos-e-garrafas', 'Mantém a temperatura por horas.'),
  ('Squeeze Inox 500ml', 'squeeze-inox-500ml', 85.00, 'copos-e-garrafas', 'Durável e elegante.'),
  ('Squeeze de Alumínio', 'squeeze-de-aluminio', 65.00, 'copos-e-garrafas', 'Leve para o dia a dia.'),
  ('Garrafa Aquaplus', 'garrafa-aquaplus', 18.90, 'copos-e-garrafas', 'BPA free e versátil.'),
  ('Garrafa Acqua Bio', 'garrafa-acqua-bio', 22.00, 'copos-e-garrafas', 'Design ergonômico.'),
  ('Garrafa Térmica Inox', 'garrafa-termica-inox', 80.00, 'copos-e-garrafas', 'Alta performance térmica.'),
  -- Taças
  ('Taça Gin Colorida', 'taca-gin-colorida', 14.50, 'tacas', 'Estilo para seus drinks.'),
  -- Chaveiros
  ('Chaveiro Acrílico', 'chaveiro-acrilico', 7.00, 'chaveiros', 'Personalização frente e verso.'),
  ('Chaveiro Acrílico Coração', 'chaveiro-acrilico-coracao', 7.00, 'chaveiros', 'Um mimo especial.'),
  ('Chaveiro Button Redondo', 'chaveiro-button-redondo', 7.50, 'chaveiros', 'Clássico e econômico.'),
  ('Chaveiro Polímero Retangular', 'chaveiro-polimero-retangular', 7.00, 'chaveiros', 'Resistente e nítido.'),
  ('Chaveiro de Metal', 'chaveiro-de-metal', 17.00, 'chaveiros', 'Acabamento premium.'),
  -- Agendas e Blocos
  ('Agenda Capa Pet', 'agenda-capa-pet', 45.00, 'agendas-e-blo-cos', 'Capa rígida durável.'),
  ('Agenda Coração', 'agenda-coracao', 45.00, 'agendas-e-blo-cos', 'Design romântico.'),
  ('Caderno Personalizado', 'caderno-personalizado', 45.00, 'agendas-e-blo-cos', 'Folhas pautadas de alta gramatura.'),
  ('Bloco de Anotação', 'bloco-de-anotacao', 17.00, 'agendas-e-blo-cos', 'Prático para recados.'),
  ('Bloco de Notas com Post-it', 'bloco-de-notas-com-post-it', 17.00, 'agendas-e-blo-cos', 'Organização completa.'),
  -- Azulejo e Relógio
  ('Azulejo 20x20', 'azulejo-20x20', 40.00, 'azulejo-e-relogio', 'Excelente para decoração.'),
  ('Azulejo 20x30', 'azulejo-20x30', 40.00, 'azulejo-e-relogio', 'Formato ampliado.'),
  ('Relógio Quadrado MDF 20x20', 'relogio-quadrado-mdf-20x20', 45.00, 'azulejo-e-relogio', 'Mecanismo silencioso.'),
  -- Almofada e Toalhas
  ('Toalha Lavabinho 21x38cm', 'toalha-lavabinho-21x38cm', 15.00, 'almofada-e-toalhas', 'Maciez e praticidade.'),
  ('Toalha Lavabinho 21x40cm', 'toalha-lavabinho-21x40cm', 12.00, 'almofada-e-toalhas', 'Compacta para levar.'),
  ('Toalha Lavabo 29x45cm', 'toalha-lavabo-29x45cm', 20.00, 'almofada-e-toalhas', 'Tamanho padrão.'),
  ('Toalha Aveludada 30x50cm', 'toalha-aveludada-30x50cm', 22.00, 'almofada-e-toalhas', 'Toque de luxo.'),
  ('Toalha de Rosto 45x70cm', 'toalha-de-rosto-45x70cm', 28.00, 'almofada-e-toalhas', 'Alta absorção.'),
  ('Toalha de Rosto 50x70cm', 'toalha-de-rosto-50x70cm', 39.90, 'almofada-e-toalhas', 'Conforto diário.'),
  ('Toalha Fitness 27x80cm', 'toalha-fitness-27x80cm', 28.00, 'almofada-e-toalhas', 'Ideal para academia.'),
  -- Outros
  ('Mousepad', 'mousepad', 15.00, 'outros', 'Deslize suave.'),
  ('Ecobag', 'ecobag', 30.00, 'outros', 'Sustentabilidade com estilo.'),
  ('Caneta', 'caneta', 3.50, 'outros', 'Escrita fluida.'),
  ('Azulejo Decorativo', 'azulejo-decorativo', 40.00, 'outros', 'Arte que decora.'),
  ('Placa Decorativa', 'placa-decorativa', 25.00, 'outros', 'Personalize seu ambiente.'),
  ('Body Infantil', 'body-infantil', 40.00, 'outros', 'Para os pequenos aventureiros.')
) AS p(title, slug, price, cat_slug, description)
JOIN public.categories c ON c.slug = p.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- 3. Resolver erro de permissão has_role (GRANT SELECT na tabela user_roles para usuários autenticados)
GRANT SELECT ON public.user_roles TO authenticated;
