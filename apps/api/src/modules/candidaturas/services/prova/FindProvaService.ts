import { inject, injectable } from "tsyringe";
import type { ProvaDaVaga, UsuarioAutenticado } from "@startagio/contracts";
import type { IVagasRepository } from "@modules/vagas/repositories/IVagasRepository";
import { ConflictError } from "@shared/errors/AppError";
import type { ICandidaturasRepository } from "../../repositories/ICandidaturasRepository";
import { garantirInscricaoAberta } from "../../utils/inscricao";

/**
 * GET /api/vagas/:id/questionario: a prova para o estudante responder.
 * A chave "correta" é removida aqui e nunca chega ao navegador (seção 6.3 do PDF).
 */
@injectable()
export class FindProvaService {
  constructor(
    @inject("VagasRepository") private vagasRepository: IVagasRepository,
    @inject("CandidaturasRepository") private candidaturasRepository: ICandidaturasRepository,
  ) {}

  async execute(usuario: UsuarioAutenticado, vagaId: number): Promise<ProvaDaVaga> {
    const vaga = await this.vagasRepository.findById(vagaId);
    garantirInscricaoAberta(vaga);

    if (await this.candidaturasRepository.findByVagaEEstudante(vagaId, usuario.id)) {
      throw new ConflictError("Você já fez a prova desta vaga.");
    }

    const questionario = await this.candidaturasRepository.findQuestionarioDaVaga(vagaId);
    if (!questionario) throw new ConflictError("Esta vaga ainda não tem prova.");

    return {
      vaga: { id: vaga.id, titulo: vaga.titulo, empresa: { nome_fantasia: vaga.empresa.nome_fantasia } },
      id: questionario.id,
      titulo: questionario.titulo,
      instrucoes: questionario.instrucoes,
      nota_minima_aprovacao: questionario.nota_minima_aprovacao,
      questoes: questionario.questoes.map(({ id, peso_nota, enunciado: { pergunta, alternativas } }) => ({
        id,
        peso_nota,
        pergunta,
        alternativas,
      })),
    };
  }
}
