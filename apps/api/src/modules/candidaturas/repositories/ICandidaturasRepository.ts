import type {
  Candidatura,
  FiltrosCandidaturas,
  FiltrosCandidatos,
  Paginado,
  RankingDaVaga,
  StatusAprovacao,
} from "@startagio/contracts";
import type { NovaCandidatura, QuestionarioComGabarito } from "../dto/CandidaturaDTO";

export interface ICandidaturasRepository {
  /** Questionário da vaga com as questões e o gabarito. null se a vaga não tem prova. */
  findQuestionarioDaVaga(vagaId: number): Promise<QuestionarioComGabarito | null>;
  findByVagaEEstudante(vagaId: number, estudanteId: number): Promise<Candidatura | null>;
  /** Grava em pontuacoes. Candidatura repetida (uq_estudante_vaga) vira ConflictError. */
  create(data: NovaCandidatura): Promise<Candidatura>;
  /** Histórico do estudante, das mais recentes para as mais antigas. */
  listByEstudante(estudanteId: number, filtros: FiltrosCandidaturas): Promise<Paginado<Candidatura>>;
  /**
   * Ranking da vaga (query 2 da seção 6.4 do PDF): nota, depois afinidade, depois quem terminou antes.
   * A posição é sempre no ranking completo, mesmo filtrando por status.
   */
  listByVaga(vagaId: number, filtros: FiltrosCandidatos): Promise<Pick<RankingDaVaga, "contagem" | "candidatos">>;
  findById(id: number): Promise<{ id: number; vaga_id: number } | null>;
  updateStatus(id: number, status: StatusAprovacao): Promise<void>;
}
