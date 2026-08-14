
-- Permitir que a função has_role (que é SECURITY DEFINER) funcione corretamente
-- quando chamada por qualquer usuário autenticado. 
-- Como a função é SECURITY DEFINER, ela executa com os privilégios do criador,
-- mas ainda precisa que a tabela tenha uma política que permita a leitura.
-- No entanto, uma solução melhor para evitar recursão infinita e garantir o funcionamento
-- é permitir que usuários autenticados leiam a tabela user_roles, mas apenas o básico
-- ou confiar totalmente na função SECURITY DEFINER (que já deveria ignorar RLS se não fosse o caso de recursão).

-- Vamos adicionar uma política simples que permite leitura se for o próprio usuário
-- (Isso já existe: user_roles_select_self)

-- O problema real de 'permission denied for function has_role' costuma ser o GRANT EXECUTE.
-- Como já fizemos o GRANT EXECUTE e o GRANT SELECT na tabela user_roles,
-- o erro persistente pode ser cache do Supabase ou a falta de GRANT USAGE no schema.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT SELECT ON public.user_roles TO anon, authenticated;
