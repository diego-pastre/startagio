import {
  STATUS_APROVACAO,
  type Candidatura,
  type FiltrosCandidaturas,
  type FiltrosCandidatos,
  type Paginado,
  type RankingDaVaga,
  type StatusAprovacao,
} from "@startagio/contracts";
import type { FakeVagasRepository } from "@modules/vagas/repositories/fakes/FakeVagasRepository";
import { ConflictError } from "@shared/errors/AppError";
import type { NovaCandidatura, QuestionarioComGabarito } from "../../dto/CandidaturaDTO";
import type { ICandidaturasRepository } from "../ICandidaturasRepository";

type CandidaturaGuardada = Candidatura & { estudante_usuario_id: number };

/** Provas por vaga (o teste registra com `registrarQuestionario`) e candidaturas em memória. */
export class FakeCandidaturasRepository implements ICandidaturasRepository {
  private questionarios = new Map<number, QuestionarioComGabarito>();
  private candidaturas: CandidaturaGuardada[] = [];
  // Cada candidatura fica 1 minuto mais nova que a anterior, para a ordenação ser previsível.
  private relogio = Date.parse("2026-01-01T12:00:00.000Z");

  constructor(private vagasRepository: FakeVagasRepository) {}

  registrarQuestionario(vagaId: number, questionario: QuestionarioComGabarito): void {
    this.questionarios.set(vagaId, questionario);
  }

  async findQuestionarioDaVaga(vagaId: number): Promise<QuestionarioComGabarito | null> {
    return this.questionarios.get(vagaId) ?? null;
  }

  async findByVagaEEstudante(vagaId: number, estudanteId: number): Promise<Candidatura | null> {
    return (
      this.candidaturas.find((item) => item.vaga.id === vagaId && item.estudante_usuario_id === estudanteId) ?? null
    );
  }

  async create(data: NovaCandidatura): Promise<Candidatura> {
    if (await this.findByVagaEEstudante(data.vaga_id, data.estudante_usuario_id)) {
      throw new ConflictError("Você já se candidatou a esta vaga.");
    }
    const vaga = await this.vagasRepository.findById(data.vaga_id);
    const questionario = this.questionarios.get(data.vaga_id);
    if (!vaga || !questionario) throw new Error(`Vaga ${data.vaga_id} sem prova no fake`);

    this.relogio += 60_000;
    const { id: empresaId, nome_fantasia, cidade, estado } = vaga.empresa;
    const candidatura: CandidaturaGuardada = {
      id: this.candidaturas.length + 1,
      estudante_usuario_id: data.estudante_usuario_id,
      vaga: {
        id: vaga.id,
        titulo: vaga.titulo,
        area_atuacao: vaga.area_atuacao,
        tipo_modelo: vaga.tipo_modelo,
        status: vaga.status,
        empresa: { id: empresaId, nome_fantasia, cidade, estado },
      },
      nota_obtida: data.nota_obtida,
      nota_minima_aprovacao: questionario.nota_minima_aprovacao,
      pontuacao_afinidade: data.pontuacao_afinidade,
      status_aprovacao: "EM_ANALISE",
      acertos: data.respostas.filter((resposta) => resposta.acertou).length,
      total_questoes: data.respostas.length,
      data_conclusao: new Date(this.relogio).toISOString(),
    };
    this.candidaturas.push(candidatura);
    this.vagasRepository.contarCandidatura(data.vaga_id);
    return candidatura;
  }

  async listByVaga(
    vagaId: number,
    { status, pagina, por_pagina }: FiltrosCandidatos,
  ): Promise<Pick<RankingDaVaga, "contagem" | "candidatos">> {
    const ranking = this.candidaturas
      .filter((item) => item.vaga.id === vagaId)
      .sort(
        (a, b) =>
          b.nota_obtida - a.nota_obtida ||
          (b.pontuacao_afinidade ?? -1) - (a.pontuacao_afinidade ?? -1) ||
          a.data_conclusao.localeCompare(b.data_conclusao),
      );
    const filtrados = ranking.filter((item) => !status || item.status_aprovacao === status);
    const contagem = Object.fromEntries(
      STATUS_APROVACAO.map((item) => [item, ranking.filter((linha) => linha.status_aprovacao === item).length]),
    ) as Record<StatusAprovacao, number>;
    return {
      contagem: { ...contagem, TODOS: ranking.length },
      candidatos: {
        dados: filtrados.slice((pagina - 1) * por_pagina, pagina * por_pagina).map((item) => ({
          id: item.id,
          posicao: ranking.indexOf(item) + 1,
          estudante: {
            id: item.estudante_usuario_id,
            nome_completo: `Estudante ${item.estudante_usuario_id}`,
            email: `estudante${item.estudante_usuario_id}@exemplo.com`,
            telefone: "31999990000",
          },
          perfil: null,
          nota_obtida: item.nota_obtida,
          pontuacao_afinidade: item.pontuacao_afinidade,
          status_aprovacao: item.status_aprovacao,
          acertos: item.acertos,
          total_questoes: item.total_questoes,
          data_conclusao: item.data_conclusao,
        })),
        total: filtrados.length,
        pagina,
        por_pagina,
        total_paginas: Math.max(1, Math.ceil(filtrados.length / por_pagina)),
      },
    };
  }

  async findById(id: number): Promise<{ id: number; vaga_id: number } | null> {
    const candidatura = this.candidaturas.find((item) => item.id === id);
    return candidatura ? { id: candidatura.id, vaga_id: candidatura.vaga.id } : null;
  }

  async updateStatus(id: number, status: StatusAprovacao): Promise<void> {
    const candidatura = this.candidaturas.find((item) => item.id === id);
    if (candidatura) candidatura.status_aprovacao = status;
  }

  async listByEstudante(
    estudanteId: number,
    { status, pagina, por_pagina }: FiltrosCandidaturas,
  ): Promise<Paginado<Candidatura>> {
    const doEstudante = this.candidaturas
      .filter((item) => item.estudante_usuario_id === estudanteId && (!status || item.status_aprovacao === status))
      .sort((a, b) => b.data_conclusao.localeCompare(a.data_conclusao));
    return {
      dados: doEstudante.slice((pagina - 1) * por_pagina, pagina * por_pagina),
      total: doEstudante.length,
      pagina,
      por_pagina,
      total_paginas: Math.max(1, Math.ceil(doEstudante.length / por_pagina)),
    };
  }
}
