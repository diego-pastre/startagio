import { inject, injectable } from "tsyringe";
import type { EditarVagaData, UsuarioAutenticado, VagaDetalhe } from "@startagio/contracts";
import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { empresaIdDoUsuario } from "../../utils/acesso";
import { PROVA_TRAVADA } from "../../utils/mensagens";

/**
 * PUT /api/vagas/:id: a empresa edita dados, perfil, cursos e a prova.
 * Regra (docs/banco-de-dados.md): depois da primeira candidatura, a prova não muda mais.
 */
@injectable()
export class UpdateVagaService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(usuario: UsuarioAutenticado, id: number, data: EditarVagaData): Promise<VagaDetalhe> {
    const empresaId = empresaIdDoUsuario(usuario);
    const vaga = await this.vagasRepository.findById(id);
    if (!vaga || vaga.empresa.id !== empresaId) throw new NotFoundError("Vaga não encontrada.");

    // Encerrada é definitiva (seção 6.4 do PDF): fica como histórico.
    if (vaga.status === "ENCERRADA") throw new ConflictError("Vaga encerrada não pode ser editada.");
    if (data.questionario && vaga.total_candidaturas > 0) throw new ConflictError(PROVA_TRAVADA);

    return this.vagasRepository.update(id, data);
  }
}
