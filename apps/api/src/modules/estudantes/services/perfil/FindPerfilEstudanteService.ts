import { inject, injectable } from "tsyringe";
import type { PerfilEstudante } from "@startagio/contracts";
import { NotFoundError } from "@shared/errors/AppError";
import type { IPerfisEstudanteRepository } from "../../repositories/IPerfisEstudanteRepository";

/** GET /api/estudantes/perfil: o 404 é o sinal para o front pedir que o estudante complete o perfil. */
@injectable()
export class FindPerfilEstudanteService {
  constructor(@inject("PerfisEstudanteRepository") private perfisRepository: IPerfisEstudanteRepository) {}

  async execute(usuarioId: number): Promise<PerfilEstudante> {
    const perfil = await this.perfisRepository.findByUsuarioId(usuarioId);
    if (!perfil) throw new NotFoundError("Perfil acadêmico ainda não preenchido.");
    return perfil;
  }
}
