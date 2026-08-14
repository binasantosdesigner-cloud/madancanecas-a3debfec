
-- O erro era a falta de GRANT SELECT na tabela products para os papéis anon e authenticated.
-- O PostgREST precisa de GRANT explícito além das políticas RLS.

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.categories TO service_role;

-- Por segurança, garantir que authenticated também possa inserir/deletar se for admin 
-- (as políticas RLS já cuidam do filtro, mas o GRANT é o primeiro portão).
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

-- Verificando outras tabelas essenciais para o funcionamento do site
GRANT SELECT ON public.favorites TO authenticated;
GRANT INSERT, DELETE ON public.favorites TO authenticated;
GRANT SELECT ON public.settings TO anon, authenticated;
