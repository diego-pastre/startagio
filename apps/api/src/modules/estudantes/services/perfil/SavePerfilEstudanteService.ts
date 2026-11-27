import { inject, injectable } from "tsyringe";
import type { PerfilEstudante, PerfilEstudanteData } from "@startagio/contracts";
import type { IPerfisEstudanteRepository } from "../../repositories/IPerfisEstudanteRepository";

/** PUT /api/estudantes/perfil: cria ou atualiza o perfil do estudante logado. */
@injectable()
export class SavePerfilEstudanteService {
  constructor(@inject("PerfisEstudanteRepository") private perfisRepository: IPerfisEstudanteRepository) {}

  execute(usuarioId: number, data: PerfilEstudanteData): Promise<PerfilEstudante> {
    return this.perfisRepository.save(usuarioId, data);
  }
}
