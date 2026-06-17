
## Objetivo

Transformar o projeto atual (TanStack Start com SSR + server functions) em uma **SPA Vite pura**, que gera apenas arquivos estáticos (`index.html` + assets) prontos pra subir via FTP na Hostinger. Auth, banco e storage continuam no Supabase, chamados direto do browser.

## O que muda

### Stack
- **Sai:** TanStack Start, SSR, `createServerFn`, rotas `/api/*`, middlewares de auth server-side, Cloudflare Workers
- **Entra:** Vite 7 + React 19 SPA, TanStack Router (file-based, sem SSR), `index.html` estático

### Roteamento
- TanStack Router continua, mas em modo **client-only** (`createRouter` sem SSR)
- Remove `__root.tsx` shell de HTML; vira `RootLayout` normal
- Remove pasta `src/routes/api/` inteira
- Remove gate `_authenticated/route.tsx` gerado pela integração e recria versão client-only equivalente

### Dados
- Toda `createServerFn` vira chamada direta `supabase.from(...)` dentro de `useQuery`/`useMutation`
- Loaders que faziam fetch no servidor passam a usar `queryClient.ensureQueryData` com `queryFn` client-side
- Auth (`requireSupabaseAuth`, `attachSupabaseAuth`) é removido — RLS no Supabase já protege tudo via JWT do usuário logado

### Build / deploy
- `vite.config.ts` reescrito sem plugins TanStack Start
- Gera `dist/` com `index.html`, `assets/*.js`, `assets/*.css`
- Adiciona `public/.htaccess` com regra de rewrite SPA pro Apache da Hostinger
- Variáveis: só `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (vão no `.env` e ficam embutidas no bundle — ok, são publishable)

## O que se perde (avisado)

- **SEO/SSR:** HTML inicial vazio, crawlers veem só shell. OG tags dinâmicas por rota deixam de funcionar (vira tag única no `index.html`)
- **`service_role`:** qualquer operação privilegiada (Auth Admin API, bypass de RLS) não roda mais. Hoje o projeto não usa.
- **Webhooks/cron:** não existem mais; se precisar no futuro, vira Edge Function Supabase
- **First paint** mais lento (SPA hydration vs HTML pronto)

## Etapas

1. **Backup mental do que tem** — confirmar inventário de server fns existentes (`rg createServerFn`)
2. **Reescrever auth client** — `src/lib/auth.tsx` já é client-side, só remover qualquer dependência de server fn
3. **Substituir server fns por chamadas Supabase direto** — para cada rota admin que usa server fn, trocar pra `supabase.from(...)` em `useQuery`
4. **Remover infra TanStack Start:**
   - Deletar `src/start.ts`, `src/server.ts` (se existir), `src/lib/error-capture.ts`, `src/lib/error-page.ts`
   - Deletar `src/integrations/supabase/auth-middleware.ts`, `auth-attacher.ts`, `client.server.ts`
   - Deletar `src/routes/api/`
   - Deletar `src/routes/_authenticated/route.tsx` (integration-managed) e recriar versão SPA
5. **Reescrever `vite.config.ts`** — Vite puro + plugin do TanStack Router (não Start)
6. **Reescrever `src/router.tsx`** — `createRouter` SPA, sem SSR
7. **Reescrever `src/routes/__root.tsx`** — vira layout React normal, sem `<html>/<body>`
8. **Criar `index.html` na raiz** com `<div id="root">` + `<script type="module" src="/src/main.tsx">`
9. **Criar `src/main.tsx`** — `ReactDOM.createRoot().render(<RouterProvider />)`
10. **Adicionar `public/.htaccess`** com fallback SPA
11. **Atualizar `package.json`** — remover deps TanStack Start, adicionar Vite plain
12. **Testar build local** — `bun run build` gera `dist/` funcional

## Detalhes técnicos

### `public/.htaccess` (Hostinger / Apache)
```text
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache de assets
<FilesMatch "\.(js|css|woff2|png|jpg|svg)$">
  Header set Cache-Control "max-age=31536000, immutable"
</FilesMatch>
```

### Estrutura final do deploy
```text
dist/
├── index.html
├── .htaccess
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── ...imagens
```
Sobe **conteúdo de `dist/`** (não a pasta) pra `public_html/` na Hostinger via FTP.

### Variáveis de ambiente
`.env` na raiz do projeto (commit ok, são chaves publishable):
```text
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Risco principal
Algumas rotas admin (ex: `admin.usuarios.tsx`) podem listar dados via server fn com privilégio elevado. Vou conferir cada uma — se alguma depende de `service_role`, precisa de política RLS nova pra admin (`has_role(auth.uid(), 'admin')`) antes da conversão funcionar.

## Próximo passo

Se aprovar, executo tudo em sequência num único batch grande. No final você roda `bun run build`, baixa o `dist/` e sobe na Hostinger.
