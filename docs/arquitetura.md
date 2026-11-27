# Arquitetura

O Startagio segue o PDF de arquitetura ([`referencia/stagio_db-arquitetura.pdf`](referencia/stagio_db-arquitetura.pdf)) com esta stack:

| Parte | Tecnologia |
|---|---|
| Monorepo | pnpm workspaces |
| Banco | MariaDB (modelo do PDF), via Prisma 7 com o adaptador `@prisma/adapter-mariadb` |
| API | Node + TypeScript, Express 5, tsyringe, zod, Vitest |
| Web | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn/ui (Radix), TanStack Query, react-hook-form |
| Contratos | `packages/contracts`: enums, schemas zod, tipos e validações usados pelo front e pelo back |

## Pastas

```
apps/
  api/                    API REST (/api/*)
    prisma/               schema.prisma e migrações
    src/
      config/env.ts       variáveis de ambiente validadas
      modules/<modulo>/   dto/, repositories/ (interfaces + fakes), infra/prisma/, infra/https/,
                          services/<entidade>/ (casos de uso), utils/, container/, __tests__/
      shared/             erros, container, providers (hash, token), infra/http (app, rotas, middlewares)
  web/                    Next.js
    src/
      app/(auth)/         login e cadastro
      app/(app)/          área logada, com um layout por perfil (estudante, empresa, instituicao)
      components/         componentes compartilhados; components/ui é o shadcn
      domains/<assunto>/  chamadas à API (api.ts) e hooks do TanStack Query (hooks.ts)
      lib/                cliente axios, sessão no servidor, rotas, helpers de formulário
      utils/              funções puras de exibição, com testes (*.test.ts)
packages/
  contracts/              compartilhado entre api e web (TypeScript puro, sem build)
docs/
```

## Como as peças conversam

1. O navegador só fala com o Next. O `next.config.ts` repassa `/api/*` para a API Express (`API_URL`). Assim o cookie de sessão fica no domínio do site e não há CORS.
2. **Login e cadastro:** a API devolve o usuário e grava o token JWT em um cookie `httpOnly` (`startagio_token`). O JavaScript da página não consegue ler esse cookie.
3. **Proteção das telas, em duas camadas:**
   - `src/proxy.ts` (o antigo middleware do Next): sem cookie, manda para `/login`. É só uma checagem rápida.
   - Os layouts de `app/(app)` chamam `GET /api/auth/me` no servidor e conferem o perfil (`ExigirNivel`). Essa é a checagem que vale.
4. **Proteção da API:** `ensureAuthenticated` carrega o usuário com as permissões atuais (mudar a tabela `permissoes` vale na hora). Depois, `ensureNivelAcesso` ou `ensurePermissao` aplicam a matriz da seção 4.1 do PDF.
5. **Validação:** o mesmo schema zod do `contracts` valida o formulário no front e o corpo da requisição na API. Erro de validação volta `422` com `{ mensagem, campos }`; duplicidade volta `409`. O formulário marca cada campo com a mensagem da API.

### Next 16.4: o que muda em relação a versões antigas

- **Cache Components ligado:** quem lê `cookies()` precisa estar dentro de um `<Suspense>`, senão o build falha. Por isso a leitura da sessão fica em componentes como `AreaLogada` e `ExigirNivel`, sempre dentro de `<Suspense>`.
- **`middleware.ts` agora se chama `proxy.ts`.**
- **`error.tsx` recebe `retry()`** (busca de novo no servidor) além do `reset()`.
- A documentação da versão instalada fica em `apps/web/node_modules/next/dist/docs/`. Consulte antes de usar uma API do Next.

## Endpoints prontos

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| GET | `/api/health` | público | checagem de vida |
| POST | `/api/auth/register` | público | cria o usuário (só Estudante ou Empresa) e já abre a sessão |
| POST | `/api/auth/login` | público | login por usuário ou e-mail |
| POST | `/api/auth/logout` | público | apaga o cookie de sessão |
| GET | `/api/auth/me` | logado | usuário, permissões e empresa (se houver) |
| GET | `/api/empresas/me` | Empresa | ficha da empresa; `404` se ainda não foi preenchida |
| POST | `/api/empresas` | Empresa | cria a ficha (Tela 1 do PDF) |
| PUT | `/api/empresas/me` | Empresa | atualiza a ficha |
| GET | `/api/vagas` | logado | mural: vagas abertas e no prazo, com filtros `busca`, `area`, `modalidade`, `curso`, `pagina` e `por_pagina` |
| GET | `/api/vagas/filtros` | logado | áreas e cursos que existem nas vagas abertas (opções dos filtros) |
| GET | `/api/vagas/minhas` | `pode_criar_vagas` | vagas da empresa logada, em qualquer status, com filtros `status`, `busca` (título ou área), `pagina` e `por_pagina` |
| POST | `/api/vagas` | `pode_criar_vagas` | cria vaga, perfil desejado e cursos numa transação só (seção 6.2 do PDF) |
| GET | `/api/vagas/:id` | logado | detalhe. Vaga que não está aberta só aparece para a empresa dona e para a instituição; para os outros, `404` |
| PATCH | `/api/vagas/:id/status` | `pode_criar_vagas` | publicar, pausar, reabrir ou encerrar, conforme `TRANSICOES_STATUS_VAGA` |
| DELETE | `/api/vagas/:id` | `pode_criar_vagas` | exclusão lógica: só muda o status para Encerrada (seção 6.4 do PDF) |
| GET | `/api/vagas/:id/questionario` | `pode_candidatar` | prova da vaga **sem** a alternativa correta; 409 se o estudante já fez ou a vaga não tem prova |
| POST | `/api/vagas/:id/responder` | `pode_candidatar` | corrige, calcula nota e afinidade e grava em `pontuacoes` (`{ "respostas": { "<id da questão>": "B" } }`) |
| PUT | `/api/vagas/:id` | `pode_criar_vagas` | edita a vaga; sem `questionario`, a prova fica como está (obrigatório quando já há candidatos) |
| GET | `/api/vagas/:id/formulario` | `pode_criar_vagas` | a vaga completa, com gabarito, para a empresa dona editar, e se a prova está travada |
| GET | `/api/vagas/:id/candidatos` | `pode_ver_candidatos` | ranking da vaga (Tela 4), com contagem por status, filtro `status` e paginação. Traz nome, e-mail e telefone do estudante; o CPF não sai da API |
| PATCH | `/api/pontuacoes/:id/status` | `pode_ver_candidatos` | aprova, reprova ou volta para análise (empresa dona) |
| GET | `/api/candidaturas` | `pode_candidatar` | "Minhas candidaturas", com filtro `status` e paginação |
| GET | `/api/estudantes/perfil` | Estudante | perfil acadêmico; `404` se ainda não foi preenchido |
| PUT | `/api/estudantes/perfil` | Estudante | cria ou atualiza o perfil acadêmico |

O corpo do `POST /api/vagas` segue o exemplo da seção 7.1 do PDF (`vaga`, `perfil_desejado`, `qualificacoes_cursos` e `questionario` com as `questoes`). A prova é obrigatória. Os enums usam os códigos (`HIBRIDO`, `BACHARELADO`), não os rótulos com acento.

## Roteiro (seção 9 do PDF)

| Fase | Situação | Entregas |
|---|---|---|
| 1. Identidade e acesso | **feita** | cadastro, login, sessão, permissões, menu por perfil, ficha da empresa com ViaCEP |
| 2. Gestão de vagas | **feita** | assistente de vaga em 3 etapas (`vagas`, `perfil_desejado`, `qualificacoes_cursos`) com rascunho ou publicação, "Minhas vagas" com publicar/pausar/reabrir/encerrar, mural com filtros e paginação, página de detalhes |
| 3. Motor de avaliação | **feita** | etapa 4 do assistente (construtor da prova), perfil acadêmico do estudante, prova online sem gabarito, cálculo da nota e da afinidade, "Minhas candidaturas" |
| 4. Seleção e homologação | em andamento: edição de vaga e ranking da empresa feitos; falta o painel da instituição | ranking de candidatos (TanStack Table), aprovação e reprovação, painel da instituição |

Antes da fase 4, resolver a pendência da instituição em [`banco-de-dados.md`](banco-de-dados.md#pendências-para-decidir-antes-das-próximas-fases). As regras da prova e a fórmula da afinidade estão em [`banco-de-dados.md`](banco-de-dados.md#prova-e-candidatura-seção-63-do-pdf).

## Visual (identidade provisória)

O site tem cara de rede social: barra no topo com ícones (no celular, uma barra fixa embaixo) e páginas em três colunas, com o cartão de perfil à esquerda, o conteúdo no meio e dicas à direita (`components/layout/grade-rede.tsx`).

A cor e a logo oficiais ainda não foram definidas. Para trocar:

- **Cor:** em `apps/web/src/app/globals.css`, mude `--marca-matiz` (matiz OKLCH, de 0 a 360). Botões, links, faixas em gradiente e o tema escuro saem desse número. `--destaque-matiz` é a cor de apoio do gradiente.
- **Logo:** troque o `<MarcaSimbolo>` em `apps/web/src/components/logo.tsx` pelo SVG ou imagem oficial. O resto do site usa o componente `<Logo>`.
- **Avatares:** sem foto, pessoas e empresas aparecem com as iniciais sobre uma cor que sai do nome (`utils/avatar.ts`). Assim cada empresa fica reconhecível no mural.

## Pontos de atenção

- **Datas:**
  - colunas DATE (`data_limite_inscricao`) trafegam como `"YYYY-MM-DD"`, sem hora, e são exibidas com `formatarData`, que não converte fuso;
  - colunas TIMESTAMP (`criado_em`) trafegam como instante ISO e são exibidas no horário de Brasília (`formatarDataDoInstante`);
  - "hoje" é sempre `hojeISO()`, no horário de Brasília. Assim a vaga não sai do mural três horas antes, como aconteceria contando em UTC.
- **Dinheiro:** o banco guarda `DECIMAL`, e a API devolve `number`. No formulário a bolsa é digitada com máscara (`1.350,00`), e o schema aceita esse texto ou o número.
- **O mesmo schema roda duas vezes:** o formulário converte o que a pessoa digitou ("30", "1.350,00") e a API valida de novo o que chegou (30, 1350). Por isso os blocos de `packages/contracts/src/schemas/campos.ts` aceitam a própria saída como entrada. Há um teste que garante isso.
- **`API_URL` no build do web:** o Next calcula os `rewrites` na hora do `next build`. Em produção, a variável precisa estar definida já no build, não só ao iniciar. Sem ela, o build para com erro (`apps/web/src/config/env.ts`). Lista completa em [`variaveis-de-ambiente.md`](variaveis-de-ambiente.md).
- **Decorators do tsyringe:** os services recebem as dependências por token (`@inject("UsuariosRepository")`) e não pelo tipo, porque tsx, tsup e Vitest não geram os metadados de tipo. O teste `src/__tests__/container.test.ts` garante que tudo resolve.
- **TypeScript fixo na 5.9:** é a versão que o Next 16.4 usa. Atualizar para a 7 exige testar o projeto todo.

## Segurança

- **Limite de tentativas no login** (`shared/infra/http/middlewares/limitarTentativasDeLogin.ts`):
  - depois de 10 senhas erradas na mesma conta em 15 minutos, o login dela fica bloqueado até a janela acabar (resposta 429 com o tempo de espera);
  - o mesmo vale para 50 senhas erradas vindas do mesmo endereço, mais folgado porque uma faculdade inteira pode sair pelo mesmo endereço de internet;
  - o endereço vem do cabeçalho `X-Real-IP`, que a entrada pública da hospedagem preenche e o Next repassa. Por isso **a API não pode ter endereço público**: só o site deve falar com ela;
  - a contagem fica na memória: zera quando a API reinicia e vale para uma cópia só da API.
- **Cadastro público só de Estudante e Empresa.** A instituição de ensino vê vagas em rascunho e vai validar estágios, então a conta dela é criada à mão: cadastre a pessoa como estudante pelo site e troque o perfil no banco:

  ```sql
  UPDATE usuarios SET nivel_acesso = 'Instituição de ensino' WHERE usuario = 'login-da-pessoa';
  ```

  Se a pessoa já tiver preenchido o perfil acadêmico, apague a linha dela em `perfil_estudante`.
- **CPF do estudante:** só ele vê o próprio. O ranking da empresa traz nome, e-mail e telefone.
