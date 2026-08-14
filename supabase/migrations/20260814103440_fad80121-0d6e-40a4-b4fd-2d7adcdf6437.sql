
-- Recriar a política products_public_read para NÃO usar has_role.
-- Isso permite que QUALQUER UM (anon ou autenticado) leia produtos ativos.
-- Para produtos inativos, apenas o sistema (service_role) terá acesso por padrão via PostgREST
-- a menos que adicionemos outra política.

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
FOR SELECT TO anon, authenticated
USING (active = true);

-- Para o Admin ver produtos inativos, precisaremos de uma política separada.
-- Mas vamos primeiro testar se isso resolve o erro de leitura pública.

-- Além disso, vamos garantir que a função has_role possa ser executada.
-- O erro 42501 em SECURITY DEFINER geralmente é resolvido com:
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
