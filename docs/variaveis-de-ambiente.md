# Variáveis de ambiente

Cada app tem o seu `.env` (fora do git) e um `.env.example` versionado. Os dois apps validam as variáveis ao subir:
se faltar alguma obrigatória, eles param com uma mensagem dizendo qual é.

- API: `apps/api/src/config/env.ts`
- Site: `apps/web/src/config/env.ts`

Em produção não existe arquivo `.env`: os valores vão no painel da hospedagem.

## API (`apps/api`)

| Variável | Obrigatória | Desenvolvimento | Produção |
|---|---|---|---|
| `NODE_ENV` | não (padrão `development`) | `development` | **`production`**: sem isso o cookie de login não sai marcado como seguro |
| `PORT` | não (padrão `3333`) | `3333` | a hospedagem costuma definir sozinha |
| `DATABASE_URL` | sim | `mysql://root:startagio@localhost:3306/stagio_db` | endereço do banco da hospedagem, no formato `mysql://usuario:senha@host:porta/banco` |
| `JWT_SECRET` | sim (mínimo 32 caracteres) | qualquer valor aleatório | valor aleatório **só de produção**, gerado com o comando abaixo |
| `JWT_EXPIRES_IN_HORAS` | não (padrão `24`) | `24` | `24` |

Para gerar o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

O `DATABASE_URL` também é lido pelo Prisma (`apps/api/prisma7.config.ts`) para aplicar as migrações (`pnpm --filter @startagio/api db:deploy`).

## Site (`apps/web`)

| Variável | Obrigatória | Desenvolvimento | Produção |
|---|---|---|---|
| `API_URL` | só em produção (em dev o padrão é `http://localhost:3333`) | `http://localhost:3333` | endereço da API visto pelo servidor do site (de preferência pela rede interna da hospedagem) |

O navegador nunca chama a API direto: o Next repassa `/api/*` para o `API_URL`. Por isso:

- nenhuma variável do site leva o prefixo `NEXT_PUBLIC_`;
- o `API_URL` precisa existir **já no build** (`next build`), porque o repasse é montado nessa hora, e também ao iniciar (`next start`), porque o servidor consulta a sessão na API.

## Cuidados

- Nunca versione um `.env`. Só os `.env.example` vão para o git, e eles não têm segredos.
- Trocar o `JWT_SECRET` desloga todo mundo.
- Em produção, prefira um usuário do banco que não seja o root.
