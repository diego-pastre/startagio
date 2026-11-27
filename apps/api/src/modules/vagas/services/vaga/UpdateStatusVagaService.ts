import { inject, injectable } from "tsyringe";
import {
  hojeISO,
  podeMudarStatus,
  STATUS_VAGA_LABEL,
  type StatusVaga,
  type UsuarioAutenticado,
  type VagaDetalhe,
} from "@startagio/contracts";
import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { empresaIdDoUsuario } from "../../utils/acesso";

/**
 * PATCH /api/vagas/:id/status (publicar, pausar, reabrir, encerrar) e DELETE /api/vagas/:id.
 * Excluir é só encerrar: a seção 6.4 do PDF manda usar exclusão lógica para manter o histórico.
 */
@injectable()
export class UpdateStatusVagaService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(usuario: UsuarioAutenticado, id: number, status: StatusVaga): Promise<VagaDetalhe> {
    const empresaId = empresaIdDoUsuario(usuario);
    const vaga = await this.vagasRepository.findById(id);
    if (!vaga || vaga.empresa.id !== empresaId) throw new NotFoundError("Vaga não encontrada.");

    if (vaga.status === status) return vaga;

    if (!podeMudarStatus(vaga.status, status)) {
      const de = STATUS_VAGA_LABEL[vaga.status].toLowerCase();
      const para = STATUS_VAGA_LABEL[status].toLowerCase();
      throw new ConflictError(`Uma vaga ${de} não pode passar para ${para}.`);
    }

    if (status === "ABERTA" && vaga.data_limite_inscricao && vaga.data_limite_inscricao < hojeISO()) {
      throw new ConflictError("A data limite de inscrição já passou.");
    }

    // A candidatura é a resposta da prova: vaga sem prova não tem como receber candidatos.
    if (status === "ABERTA" && !vaga.questionario) {
      throw new ConflictError("Esta vaga não tem prova. Edite a vaga e crie a prova antes de publicar.");
    }

    return this.vagasRepository.updateStatus(id, status);
  }
}
