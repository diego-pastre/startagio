import { inject, injectable } from "tsyringe";
import type { UsuarioAutenticado, VagaDetalhe } from "@startagio/contracts";
import { NotFoundError } from "@shared/errors/AppError";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { podeVerVaga } from "../../utils/acesso";

/** GET /api/vagas/:id: detalhe completo, com perfil desejado e cursos. */
@injectable()
export class FindVagaService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(usuario: UsuarioAutenticado, id: number): Promise<VagaDetalhe> {
    const vaga = await this.vagasRepository.findById(id);
    // Quem não pode ver recebe o mesmo 404 de uma vaga inexistente, para não revelar rascunhos de outras empresas.
    if (!vaga || !podeVerVaga(usuario, vaga)) throw new NotFoundError("Vaga não encontrada.");
    return vaga;
  }
}
