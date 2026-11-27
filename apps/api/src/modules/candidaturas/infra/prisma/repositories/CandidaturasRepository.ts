import {
  STATUS_APROVACAO,
  type Candidatura,
  type CandidatoDaVaga,
  type FiltrosCandidaturas,
  type FiltrosCandidatos,
  type Paginado,
  type RankingDaVaga,
  type StatusAprovacao,
} from "@startagio/contracts";
import { ConflictError } from "@shared/errors/AppError";
import { prisma } from "@shared/infra/prisma/client";
import { Prisma } from "@shared/infra/prisma/models";
import type { NovaCandidatura, QuestionarioComGabarito, RespostaCorrigida } from "../../../dto/CandidaturaDTO";
import type { ICandidaturasRepository } from "../../../repositories/ICandidaturasRepository";
import { lerEnunciado } from "../../../utils/enunciado";

const JA_CANDIDATOU = "Você já se candidatou a esta vaga.";

const includeCandidatura = {
  vaga: {
    select: {
      id: true,
      titulo: true,
      area_atuacao: true,
      tipo_modelo: true,
      status: true,
      empresa: { select: { id: true, nome_fantasia: true, cidade: true, estado: true } },
    },
  },
  questionario: { select: { nota_minima_aprovacao: true, _count: { select: { questoes: true } } } },
} satisfies Prisma.PontuacaoInclude;

type CandidaturaDoBanco = Prisma.PontuacaoGetPayload<{ include: typeof includeCandidatura }>;

// Ranking da query 2 da seção 6.4 do PDF. O MariaDB põe NULL por último em DESC: afinidade vazia fica atrás.
const ordemDoRanking = [
  { nota_obtida: "desc" },
  { pontuacao_afinidade: "desc" },
  { data_conclusao: "asc" },
  { id: "asc" },
] satisfies Prisma.PontuacaoOrderByWithRelationInput[];

const includeCandidato = {
  estudante: {
    select: {
      id: true,
      nome_completo: true,
      email: true,
      telefone: true,
      // CPF não entra: a empresa só precisa do contato (proteção de dados).
      perfil_estudante: { select: { curso: true, semestre_atual: true, instituicao_ensino: true } },
    },
  },
  questionario: { select: { _count: { select: { questoes: true } } } },
} satisfies Prisma.PontuacaoInclude;

/** O MariaDB guarda JSON como texto: dependendo do driver, a coluna chega já lida ou como string. */
function lerRespostas(valor: Prisma.JsonValue | null): RespostaCorrigida[] {
  const lido: unknown = typeof valor === "string" ? JSON.parse(valor) : valor;
  return Array.isArray(lido) ? (lido as RespostaCorrigida[]) : [];
}

function toCandidatura(linha: CandidaturaDoBanco): Candidatura {
  const respostas = lerRespostas(linha.respostas);
  return {
    id: linha.id,
    vaga: linha.vaga,
    nota_obtida: linha.nota_obtida.toNumber(),
    nota_minima_aprovacao: linha.questionario.nota_minima_aprovacao.toNumber(),
    pontuacao_afinidade: linha.pontuacao_afinidade?.toNumber() ?? null,
    status_aprovacao: linha.status_aprovacao,
    acertos: respostas.filter((resposta) => resposta.acertou).length,
    total_questoes: respostas.length || linha.questionario._count.questoes,
    data_conclusao: linha.data_conclusao.toISOString(),
  };
}

function toCandidato(
  linha: Prisma.PontuacaoGetPayload<{ include: typeof includeCandidato }>,
  posicao: number,
): CandidatoDaVaga {
  const respostas = lerRespostas(linha.respostas);
  const { perfil_estudante: perfil, ...estudante } = linha.estudante;
  return {
    id: linha.id,
    posicao,
    estudante,
    perfil,
    nota_obtida: linha.nota_obtida.toNumber(),
    pontuacao_afinidade: linha.pontuacao_afinidade?.toNumber() ?? null,
    status_aprovacao: linha.status_aprovacao,
    acertos: respostas.filter((resposta) => resposta.acertou).length,
    total_questoes: respostas.length || linha.questionario._count.questoes,
    data_conclusao: linha.data_conclusao.toISOString(),
  };
}

export class CandidaturasRepository implements ICandidaturasRepository {
  async listByVaga(
    vagaId: number,
    { status, pagina, por_pagina }: FiltrosCandidatos,
  ): Promise<Pick<RankingDaVaga, "contagem" | "candidatos">> {
    const where: Prisma.PontuacaoWhereInput = { vaga_id: vagaId, status_aprovacao: status };
    const [ranking, grupos, total, linhas] = await prisma.$transaction([
      // Só os ids, na ordem do ranking completo: dá a posição de cada um mesmo com filtro de status.
      prisma.pontuacao.findMany({ where: { vaga_id: vagaId }, select: { id: true }, orderBy: ordemDoRanking }),
      prisma.pontuacao.groupBy({
        by: ["status_aprovacao"],
        where: { vaga_id: vagaId },
        _count: { _all: true },
        orderBy: { status_aprovacao: "asc" },
      }),
      prisma.pontuacao.count({ where }),
      prisma.pontuacao.findMany({
        where,
        include: includeCandidato,
        orderBy: ordemDoRanking,
        skip: (pagina - 1) * por_pagina,
        take: por_pagina,
      }),
    ]);

    const posicoes = new Map(ranking.map((linha, indice) => [linha.id, indice + 1]));
    const contagem = Object.fromEntries(STATUS_APROVACAO.map((item) => [item, 0])) as Record<StatusAprovacao, number>;
    for (const grupo of grupos) {
      contagem[grupo.status_aprovacao] = typeof grupo._count === "object" ? (grupo._count._all ?? 0) : 0;
    }

    return {
      contagem: { ...contagem, TODOS: ranking.length },
      candidatos: {
        dados: linhas.map((linha) => toCandidato(linha, posicoes.get(linha.id) ?? 0)),
        total,
        pagina,
        por_pagina,
        total_paginas: Math.max(1, Math.ceil(total / por_pagina)),
      },
    };
  }

  findById(id: number): Promise<{ id: number; vaga_id: number } | null> {
    return prisma.pontuacao.findUnique({ where: { id }, select: { id: true, vaga_id: true } });
  }

  async updateStatus(id: number, status: StatusAprovacao): Promise<void> {
    await prisma.pontuacao.update({ where: { id }, data: { status_aprovacao: status } });
  }

  async findQuestionarioDaVaga(vagaId: number): Promise<QuestionarioComGabarito | null> {
    const questionario = await prisma.questionario.findUnique({
      where: { vaga_id: vagaId },
      include: { questoes: { orderBy: { id: "asc" } } },
    });
    if (!questionario) return null;
    return {
      id: questionario.id,
      titulo: questionario.titulo,
      instrucoes: questionario.instrucoes,
      nota_minima_aprovacao: questionario.nota_minima_aprovacao.toNumber(),
      questoes: questionario.questoes.map((questao) => ({
        id: questao.id,
        peso_nota: questao.peso_nota.toNumber(),
        enunciado: lerEnunciado(questao.enunciado),
      })),
    };
  }

  async findByVagaEEstudante(vagaId: number, estudanteId: number): Promise<Candidatura | null> {
    const linha = await prisma.pontuacao.findUnique({
      where: { vaga_id_estudante_usuario_id: { vaga_id: vagaId, estudante_usuario_id: estudanteId } },
      include: includeCandidatura,
    });
    return linha && toCandidatura(linha);
  }

  async create({ respostas, ...dados }: NovaCandidatura): Promise<Candidatura> {
    try {
      // status_aprovacao fica no padrão do banco ("Em Analise"): quem decide é a empresa (fase 4).
      const linha = await prisma.pontuacao.create({
        data: { ...dados, respostas: respostas as unknown as Prisma.InputJsonValue },
        include: includeCandidatura,
      });
      return toCandidatura(linha);
    } catch (erro) {
      // Duas abas enviando a mesma prova ao mesmo tempo: a chave uq_estudante_vaga segura a segunda.
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
        throw new ConflictError(JA_CANDIDATOU);
      }
      throw erro;
    }
  }

  async listByEstudante(
    estudanteId: number,
    { status, pagina, por_pagina }: FiltrosCandidaturas,
  ): Promise<Paginado<Candidatura>> {
    const where: Prisma.PontuacaoWhereInput = { estudante_usuario_id: estudanteId, status_aprovacao: status };
    const [total, linhas] = await prisma.$transaction([
      prisma.pontuacao.count({ where }),
      prisma.pontuacao.findMany({
        where,
        include: includeCandidatura,
        orderBy: [{ data_conclusao: "desc" }, { id: "desc" }],
        skip: (pagina - 1) * por_pagina,
        take: por_pagina,
      }),
    ]);
    return {
      dados: linhas.map(toCandidatura),
      total,
      pagina,
      por_pagina,
      total_paginas: Math.max(1, Math.ceil(total / por_pagina)),
    };
  }
}
