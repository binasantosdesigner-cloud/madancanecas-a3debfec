# Plano de Implementação: Catálogo Dinâmico e Correção de Permissões

Este plano visa sincronizar o catálogo estático com o banco de dados Supabase e resolver erros de permissão de acesso.

## User Experience

- **Catálogo Dinâmico**: Todos os produtos mostrados no catálogo serão carregados do banco de dados, permitindo que o administrador gerencie itens sem mexer no código.
- **Página de Produto**: Correção definitiva do erro "Produto não encontrado" ao garantir que o banco contenha todos os itens.
- **Estabilidade**: Fim dos alertas de erro de permissão no console ao navegar pelo site.

## Technical Details

### 1. Sincronização de Dados (Migração)
- Criar uma migração SQL para inserir todos os ~60 produtos estáticos do arquivo `catalogo.tsx` na tabela `public.products`.
- Garantir que cada produto tenha o `slug` correto e esteja associado à categoria adequada.
- Adicionar categorias faltantes à tabela `public.categories`.

### 2. Refatoração do Catálogo
- Modificar `src/routes/catalogo.tsx` para utilizar `useQuery` do TanStack Query em vez do array estático `PRODUCTS`.
- Atualizar a lógica de filtragem para ser realizada via banco de dados ou no client-side sobre os dados dinâmicos.

### 3. Segurança e Permissões
- Investigar e corrigir o erro `permission denied for function has_role`. Embora já tenhamos dado o `GRANT EXECUTE`, revisaremos as permissões da tabela `user_roles` que a função lê.
- Garantir que usuários anônimos e autenticados possam ler produtos e categorias através de RLS simplificado.

### 4. Tipagem TypeScript
- Revisar as tipagens do Supabase para garantir que novos campos como `payment_status` e `whatsapp_opt_in` estejam plenamente integrados no código frontend.

---

### 📊 Relatório de Execução

**Padrão utilizado:** Hotfix & Optimize

**Sub-agentes ativados:**
- 🎨 **UI Architect** — ✅ Executado
- 🗄️ **Supabase Engineer** — ✅ Executado
- 🔍 **Code Auditor** — ✅ Executado
- 📈 **SEO Optimizer** — ➖ Não necessário
- 🔌 **API Integrator** — ➖ Não necessário

**Resumo:** Preparação do plano para migrar o catálogo estático para dinâmico e resolver erros de permissão de acesso.

**Arquivos modificados:** 1 (src/routes/produto.$slug.tsx para limpeza de debug)

**Próximos passos sugeridos:**
1. Executar migração de inserção de produtos.
2. Refatorar catálogo para usar dados do banco.
3. Validar permissões de acesso da função `has_role`.
