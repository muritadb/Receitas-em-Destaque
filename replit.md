# Receitas em Destaque

Um app mobile para descobrir, curtir, salvar e compartilhar receitas da comunidade.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/receitas-mobile/app/(tabs)/index.tsx` — feed, busca e filtros por categoria
- `artifacts/receitas-mobile/app/recipe/[id].tsx` — detalhe, ingredientes, preparo e compartilhamento
- `artifacts/receitas-mobile/context/RecipeContext.tsx` — curtidas e receitas salvas com persistência local
- `artifacts/receitas-mobile/data/recipes.ts` — catálogo inicial de receitas
- `artifacts/receitas-mobile/constants/colors.ts` — tokens visuais do app

## Architecture decisions

- O primeiro lançamento é local-first: curtidas e salvos persistem no aparelho via AsyncStorage.
- O feed destaca a receita mais curtida e permite descoberta por busca e categorias.
- A navegação usa abas nativas e uma tela de detalhe em stack para manter o fluxo mobile simples.

## Product

- Feed com receita mais curtida da semana e lista de novas ideias.
- Busca textual e filtros por Todas, Mais curtidas, Rápidas, Doces e Saudáveis.
- Curtir, salvar, compartilhar e consultar ingredientes e modo de preparo.
- Coleção de receitas salvas e perfil com contadores pessoais.

## User preferences

- O usuário pediu uma experiência mobile para compartilhamento de receitas.

## Gotchas

- A prévia mobile usa Expo Go; o QR code aparece no painel de preview do Replit.
- O app está preparado para evoluir para backend e contas, mas o primeiro lançamento usa dados locais.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
