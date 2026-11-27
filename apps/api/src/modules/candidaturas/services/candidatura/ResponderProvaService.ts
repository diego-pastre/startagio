import { inject, injectable } from "tsyringe";
import type { Candidatura, ResponderProvaData, UsuarioAutenticado } from "@startagio/contracts";
import type { IPerfisEstudanteRepository } from "@modules/estudantes/repositories/IPerfisEstudanteRepository";
import type { IVagasRepository } from "@modules/vagas/repositories/IVagasRepository";
import { AppError, ConflictError } from "@shared/errors/AppError";
import type { ICandidaturasRepository } from "../../repositories/ICandidaturasRepository";
import { calcularAfinidade } from "../../utils/afinidade";
import { corrigirProva, questoesSemResposta } from "../../utils/correcao";
import { garantirInscricaoAberta } from "../../utils/inscricao";

export const PERFIL_PENDENTE = "Complete seu perfil acadêmico antes de se candidatar.";

/**
 * POST /api/vagas/:id/responder: corrige a prova, calcula nota e afinidade e grava a candidatura
 * em pontuacoes (seção 6.3 do PDF). O estudante vem da sessão, nunca do corpo.
 */
@injectable()
export class ResponderProvaService {
  constructor(
    @inject("VagasRepository") private vagasRepository: IVagasRepository,
    @inject("CandidaturasRepository") private candidaturasRepository: ICandidaturasRepository,
    @inject("PerfisEstudanteRepository") private perfisRepository: IPerfisEstudanteRepository,
  ) {}

  async execute(usuario: UsuarioAutenticado, vagaId: number, { respostas }: ResponderProvaData): Promise<Candidatura> {
    const vaga = await this.vagasRepository.findById(vagaId);
    garantirInscricaoAberta(vaga);

    if (await this.candidaturasRepository.findByVagaEEstudante(vagaId, usuario.id)) {
      throw new ConflictError("Você já se candidatou a esta vaga.");
    }

    const perfil = await this.perfisRepository.findByUsuarioId(usuario.id);
    if (!perfil) throw new ConflictError(PERFIL_PENDENTE);

    const questionario = await this.candidaturasRepository.findQuestionarioDaVaga(vagaId);
    if (!questionario) throw new ConflictError("Esta vaga ainda não tem prova.");

    const faltando = questoesSemResposta(questionario.questoes, respostas);
    if (Object.keys(faltando).length) throw new AppError("Responda todas as questões antes de enviar.", 422, faltando);

    const correcao = corrigirProva(questionario.questoes, respostas);
    return this.candidaturasRepository.create({
      vaga_id: vagaId,
      estudante_usuario_id: usuario.id,
      questionario_id: questionario.id,
      nota_obtida: correcao.nota_obtida,
      pontuacao_afinidade: calcularAfinidade({
        estudante: perfil,
        perfilDesejado: vaga.perfil_desejado,
        cursos: vaga.cursos,
        nota: correcao.nota_obtida,
      }),
      respostas: correcao.respostas,
    });
  }
}
