# Startagio

Plataforma de vagas de estágio que conecta três perfis:

- **Estudante:** procura vagas e faz a avaliação de cada uma.
- **Empresa:** publica vagas com o perfil desejado e uma prova, e escolhe candidatos pelo ranking.
- **Instituição de ensino:** acompanha e valida os estágios.

A arquitetura oficial está em [`docs/referencia/stagio_db-arquitetura.pdf`](docs/referencia/stagio_db-arquitetura.pdf).

## Stack

Monorepo pnpm com:

- `apps/api`: Node, TypeScript, Express, Prisma e MariaDB;
- `apps/web`: Next.js, React, Tailwind, shadcn/ui, TanStack Query;
- `packages/contracts`: validações e tipos compartilhados entre os dois.

Detalhes em [`docs/arquitetura.md`](docs/arquitetura.md).

## Pré-requisitos

- Node 22 ou mais novo
- pnpm 12 (`corepack enable pnpm`)
- MariaDB: pelo Docker (`docker-compose.yml`) ou na versão portátil, sem instalador ([docs/banco-de-dados.md](docs/banco-de-dados.md#sem-docker-mariadb-portátil))

## Primeira vez

```bash
pnpm install

# variáveis de ambiente (os exemplos já servem para o banco do Docker)
cp apps/api/.env.example apps/api/.env      # preencha o JWT_SECRET
cp apps/web/.env.example apps/web/.env

pnpm db:up        # sobe MariaDB + phpMyAdmin (ou ligue o MariaDB portátil)
pnpm db:migrate   # cria as tabelas e carrega as permissões
pnpm dev          # API em http://localhost:3333 e site em http://localhost:3000
```

## Scripts da raiz

| Script | O que faz |
|---|---|
| `pnpm dev` | API e site juntos (`dev:api` e `dev:web` sobem separado) |
| `pnpm typecheck` | `tsc` em todos os pacotes |
| `pnpm test` | testes (Vitest) do `contracts`, da API e das funções do site |
| `pnpm lint` | ESLint do site |
| `pnpm build` | build da API (tsup) e do site (Next) |
| `pnpm db:up` / `pnpm db:down` | liga e desliga o banco do Docker |
| `pnpm db:migrate` | aplica as migrações do Prisma |
| `pnpm db:studio` | abre o Prisma Studio para ver os dados |

## Documentação

- [`docs/arquitetura.md`](docs/arquitetura.md): como as peças conversam, endpoints prontos e roteiro das fases
- [`docs/banco-de-dados.md`](docs/banco-de-dados.md): o que mudou em relação ao PDF e as decisões pendentes
- [`docs/variaveis-de-ambiente.md`](docs/variaveis-de-ambiente.md): o que cada app precisa, em desenvolvimento e em produção
