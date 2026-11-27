import { inject, injectable } from "tsyringe";
import type { StatusAprovacao, UsuarioAutenticado } from "@startagio/contracts";
import type { IVagasRepository } from "@modules/vagas/repositories/IVagasRepository";
import { empresaIdDoUsuario } from "@modules/vagas/utils/acesso";
import { NotFoundError } from "@shared/errors/AppError";
import type { ICandidaturasRepository } from "../../repositories/ICandidaturasRepository";

const NAO_ENCONTRADA = "Candidatura não encontrada.";

/**
 * PATCH /api/pontuacoes/:id/status: a empresa dona da vaga aprova, reprova ou volta para análise.
 * A instituição de ensino ainda não altera este status (pendência 3 de docs/banco-de-dados.md).
 */
@injectable()
export class UpdateStatusCandidaturaService {
  constructor(
    @inject("VagasRepository") private vagasRepository: IVagasRepository,
    @inject("CandidaturasRepository") private candidaturasRepository: ICandidaturasRepository,
  ) {}

  async execute(
    usuario: UsuarioAutenticado,
    id: number,
    status: StatusAprovacao,
  ): Promise<{ id: number; status_aprovacao: StatusAprovacao }> {
    const empresaId = empresaIdDoUsuario(usuario);
    const candidatura = await this.candidaturasRepository.findById(id);
    if (!candidatura) throw new NotFoundError(NAO_ENCONTRADA);

    const vaga = await this.vagasRepository.findById(candidatura.vaga_id);
    if (!vaga || vaga.empresa.id !== empresaId) throw new NotFoundError(NAO_ENCONTRADA);

    await this.candidaturasRepository.updateStatus(id, status);
    return { id, status_aprovacao: status };
  }
}
