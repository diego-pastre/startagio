# AGENTS.md: Startagio

Vale para Claude Code e Codex. O `CLAUDE.md` daqui só aponta para este arquivo.

## Antes de mexer

- A **arquitetura oficial é o PDF** em `docs/referencia/stagio_db-arquitetura.pdf`. Mudança no modelo de dados ou nas regras do PDF precisa ser combinada e registrada em `docs/banco-de-dados.md`.
- Leia `docs/arquitetura.md` (como as peças conversam) e `docs/banco-de-dados.md` (diferenças em relação ao PDF e pendências).
- **Next 16.4 mudou muito.** Antes de usar uma API do Next, leia `apps/web/AGENTS.md` e a documentação da versão instalada em `apps/web/node_modules/next/dist/docs/`.

## Onde cada coisa fica

- **Enum, schema zod, tipo de resposta da API e validação de documento:** `packages/contracts`. Nunca duplique no front ou no back.
- **Enum novo ou alterado:** mude o `schema.prisma` (com `@map` para o valor do PDF) e o `packages/contracts/src/enums.ts`. O teste `apps/api/src/__tests__/enums.test.ts` confere os dois.
- **API:** módulos em `apps/api/src/modules/<modulo>/`:
  - `services/` só tem casos de uso (classe `@injectable()` com `execute()`);
  - função auxiliar vai em `utils/`;
  - repositório tem interface em `repositories/`, implementação em `infra/prisma/` e fake em `repositories/fakes/`;
  - dependência entra por token: `@inject("XRepository")`.
- **Web:**
  - a página compõe;
  - chamadas HTTP e hooks do TanStack Query ficam em `src/domains/<assunto>/`;
  - HTTP sempre pelo cliente de `src/lib/api.ts`;
  - funções puras de exibição (textos, formatação) ficam em `src/utils/`, com teste ao lado (`*.test.ts`).
- **Sessão no servidor:** `src/lib/sessao.ts`. Quem lê a sessão fica dentro de `<Suspense>` (regra do Cache Components).

## Regras

- O `usuario_id` e o `empresa_id` vêm sempre da sessão (`req.usuario`), nunca do corpo da requisição.
- A chave `correta` das questões nunca sai da API para o estudante (seção 6.3 do PDF).
- Toda listagem leva filtro e paginação.
- Não leia nem exponha valores de `.env`. Só os `.env.example` são versionados.
- Banco: mudança de schema sempre por migração nova (`pnpm db:migrate`). Nunca edite uma migração já aplicada.

## Antes de dar por pronto

Rode na raiz:

```bash
pnpm typecheck && pnpm test && pnpm lint && pnpm build
```

Diga o que foi verificado e o que não foi (por exemplo, fluxo que depende do banco e não foi testado).
