# Banco de dados

A arquitetura oficial do banco é o PDF em [`referencia/stagio_db-arquitetura.pdf`](referencia/stagio_db-arquitetura.pdf): MariaDB, 9 tabelas, mesmos nomes de tabelas, colunas e constraints. O schema fica em [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma) e as migrações em `apps/api/prisma/migrations/`.

## Como subir o banco local

```bash
pnpm db:up        # MariaDB 11.4 + phpMyAdmin (docker-compose.yml)
pnpm db:migrate   # aplica as migrações e roda o prisma generate
```

- phpMyAdmin: http://localhost:8080 (usuário `root`, senha `startagio`).
- Para ver os dados sem phpMyAdmin: `pnpm db:studio` (Prisma Studio).

### Sem Docker: MariaDB portátil

O MariaDB tem uma versão `.zip` para Windows que roda sem instalador e sem admin. O roteiro abaixo foi testado com a 11.4.14:

1. Baixe `mariadb-11.4.x-winx64.zip` em https://mariadb.org/download/ e confira o SHA-256 publicado na mesma página.
2. Extraia numa pasta fora do projeto, por exemplo `C:\Users\<voce>\mariadb-startagio`.
3. Crie a pasta de dados com a senha de root que o `.env` usa:
   `bin\mariadb-install-db.exe --datadir=<pasta>\data --password=startagio --port=3306`
4. No `data\my.ini`, dentro de `[mysqld]`, acrescente `bind-address=127.0.0.1`, `character-set-server=utf8mb4` e `collation-server=utf8mb4_unicode_ci`.
5. Para ligar: `bin\mariadbd.exe --defaults-file=<pasta>\data\my.ini`. Para desligar: `bin\mariadb-admin.exe -u root -pstartagio shutdown`.
6. Crie o banco: `bin\mariadb.exe -u root -pstartagio -e "CREATE DATABASE stagio_db"`. Depois rode `pnpm db:migrate`.
- Para mudar o banco: edite o `schema.prisma` e rode `pnpm db:migrate`. O Prisma pede um nome e gera a migração nova. Nunca edite uma migração que já foi aplicada.

## O que mudou em relação ao PDF

| # | Mudança | Por quê |
|---|---|---|
| 1 | Tabela `permissoes` já vem com as 3 linhas (na migração `init`) | Seção 8.1 do PDF: sem essas linhas ninguém consegue logar |
| 2 | FK `fk_empresas_usuarios` (empresas → usuarios, `CASCADE`) | Seção 8.1 do PDF |
| 3 | `usuarios.telefone` virou `VARCHAR(20)` | Seção 8.1 do PDF: celular com DDD estoura o `int(11)` |
| 4 | `usuarios.endereço` virou `endereco` | Seção 8 do PDF: o cedilha no nome da coluna quebra ORMs |
| 5 | FK nova `fk_usuarios_permissoes` (usuarios.nivel_acesso → permissoes) | Garante que todo usuário tem linha em `permissoes`, que é o que o `INNER JOIN` do login do PDF supõe |
| 6 | `usuario VARCHAR(50)`, `email VARCHAR(180)`, `cpf CHAR(11)` e `nome_completo VARCHAR(150)`, os três primeiros com índice único | O PDF manda validar esses limites e a unicidade na aplicação; agora o banco também garante. O e-mail ficou obrigatório porque o login aceita e-mail e o formulário do PDF já pede o campo |
| 7 | `criado_em` e `atualizado_em` em `usuarios` | Auditoria, igual às outras tabelas |
| 8 | CPF, CNPJ, CEP e telefones são gravados **só com os caracteres, sem máscara** | Com e sem máscara misturados, o índice único do CNPJ não pegaria duplicados. O front aplica a máscara para exibir |
| 9 | CNPJ aceita letras | CNPJ alfanumérico da Receita (IN RFB 2.229/2024), emitido desde julho de 2026. O cálculo dos dígitos está em `packages/contracts/src/utils/documentos.ts` |
| 10 | Collation `utf8mb4_unicode_ci` em vez de `utf8mb4_general_ci` | É a que o Prisma usa e ordena melhor os acentos do português |
| 11 | `atualizado_em` é preenchido pelo Prisma (`@updatedAt`), não por `ON UPDATE CURRENT_TIMESTAMP` | Limitação do Prisma. Quem editar direto pelo phpMyAdmin precisa atualizar essa coluna à mão |
| 12 | MariaDB 11.4 no Docker | A 10.4 do PDF saiu de suporte em 2024. O schema não usa nada que não exista na 10.4 |
| 13 | Tabela nova `perfil_estudante` (curso, grau, semestre atual, instituição, idioma e nível), 1:1 com `usuarios` (`CASCADE`) | O cálculo de afinidade da seção 6.3 usa curso, semestre e idioma do estudante, que nenhuma tabela do PDF guardava. Decisão de 27/11/2026 (pendência 2) |
| 14 | Coluna nova `pontuacoes.respostas` (JSON) com cada questão: alternativa marcada, a correta e se acertou | Permite conferir uma nota contestada. Decisão de 27/11/2026 (pendência 4) |
| 15 | A prova é obrigatória: `POST /api/vagas` exige o questionário, e uma vaga sem prova não pode ser publicada nem reaberta | É o que o PDF já supõe (`pontuacoes.questionario_id` e `nota_obtida` obrigatórios). Decisão de 27/11/2026 (pendência 1) |

O resto segue o PDF, inclusive os detalhes:

- `questoes.enunciado` é `TEXT` com JSON;
- as regras de exclusão (`RESTRICT`/`CASCADE`) são as da seção 2.2;
- os nomes das constraints são os mesmos.

### Enums: valor no banco x valor na API

No banco, os enums gravam exatamente os valores do PDF (`'Instituição de ensino'`, `'Híbrido'`, `'Em Analise'`). No código e na API usamos um código sem acento (`INSTITUICAO_ENSINO`, `HIBRIDO`, `EM_ANALISE`), e o Prisma faz a tradução com `@map`. Valor com acento e espaço trafegando na API é fonte de erro (o próprio PDF alerta para isso na seção 3.1). Os rótulos de tela ficam em `packages/contracts/src/enums.ts`, e um teste da API (`src/__tests__/enums.test.ts`) quebra se as listas do schema e do contracts se separarem.

## Criação de vagas (seção 6.2 do PDF)

O PDF pede `START TRANSACTION`/`COMMIT` gravando vaga, perfil desejado, cursos, questionário e questões. No código isso é uma escrita aninhada do Prisma (`apps/api/src/modules/vagas/infra/prisma/repositories/VagasRepository.ts`): um único `prisma.vaga.create` com `perfil_desejado: { create }` e `qualificacoes_cursos: { create }`. O Prisma roda tudo numa transação só; se uma parte falhar, nada é gravado. O questionário e as questões entram do mesmo jeito na fase 3.

## Exclusão de vagas

As regras são as do PDF. Use **exclusão lógica** (`status = 'Encerrada'`), como a seção 6.4 recomenda. Para apagar uma vaga de verdade, apague antes, na mesma transação, `qualificacoes_cursos`, `perfil_desejado` e `pontuacoes` da vaga. `pontuacoes → questionarios` é `RESTRICT`, e o `CASCADE` da vaga para o questionário falharia se ainda houver pontuação.

## Prova e candidatura (seção 6.3 do PDF)

- **Enunciado:** cada questão grava em `questoes.enunciado` o JSON `{ "pergunta", "alternativas": { "A".."D" }, "correta" }`. A API remove a chave `correta` antes de mandar a prova para o estudante (`GET /api/vagas/:id/questionario`).
- **Nota:** `[ soma dos pesos das questões certas ÷ soma de todos os pesos ] × 10`, com duas casas (`apps/api/src/modules/candidaturas/utils/correcao.ts`).
- **Afinidade (0 a 100):** o PDF só diz que ela combina curso, semestre e idioma com o desempenho na prova. A fórmula é nossa (`utils/afinidade.ts`, com testes):
  - cada critério que a vaga pede vale de 0 a 100. **Curso:** 100 se o curso do estudante está na lista da vaga (sem diferenciar acento e maiúscula), senão 0. **Semestre:** 100 dentro da faixa, perde 25 por semestre fora. **Idioma:** 100 se tem o idioma no nível pedido ou acima, perde 35 por nível abaixo, 0 sem o idioma;
  - critério que a vaga não pede fica fora da média; vaga sem nenhum requisito tem aderência 100;
  - **afinidade = 60% da aderência + 40% da nota × 10.**
- **Status inicial:** toda candidatura começa `Em Analise`, mesmo abaixo da nota mínima (o PDF deixa a empresa escolher). Quem aprova ou reprova é a empresa, na fase 4.
- **Uma tentativa por vaga:** garantida pela chave `uq_estudante_vaga`. O detalhe da vaga traz `minha_candidatura` (o `ja_candidatou` da Tela 3) para o front trocar o botão pela nota e o status.
- **Perfil obrigatório:** sem `perfil_estudante`, a API recusa a candidatura (409) e o front manda completar o perfil antes da prova.
- **Vagas antigas:** as vagas criadas na fase 2 não têm prova. Elas não recebem candidaturas nem podem ser publicadas até a empresa criar a prova pela edição.

## Edição de vagas e ranking

- **Editar** (`PUT /api/vagas/:id`): a empresa dona edita dados, perfil desejado, cursos e prova numa transação. Os cursos são trocados pela lista nova. O status muda só pelo `PATCH /status`, e vaga encerrada não é editada.
- **Prova travada:** depois da primeira candidatura, a prova não muda mais (as notas já dadas usaram aquele gabarito). O front não manda o `questionario` e a API recusa com 409 se vier. A checagem é repetida dentro da transação, caso uma candidatura chegue no meio da edição. Decisão de 27/11/2026.
- **Ranking** (`GET /api/vagas/:id/candidatos`, Tela 4 do PDF): ordem da query 2 da seção 6.4 (nota, afinidade, data de conclusão). A posição é sempre a do ranking completo, mesmo filtrando por status. Só a empresa dona vê, porque a tela mostra CPF, e-mail e telefone.
- **Aprovar e reprovar** (`PATCH /api/pontuacoes/:id/status`): por enquanto só a empresa dona. A instituição entra quando a pendência 1 abaixo for decidida.

## Pendências para decidir antes das próximas fases

Resolvidas em 27/11/2026: prova obrigatória (mudança 15), perfil do estudante em tabela própria (mudança 13) e respostas guardadas (mudança 14).

1. **Instituição de ensino.** Não há vínculo entre o aluno e a instituição, nem um campo de "homologado". Pelo PDF, a instituição altera o mesmo `status_aprovacao` que a empresa usa, então uma pode sobrescrever a decisão da outra. Decidir antes da fase 4.
