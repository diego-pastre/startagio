import { inject, injectable } from "tsyringe";
import { NotFoundError } from "@shared/errors/AppError";
import type { Empresa } from "@shared/infra/prisma/models";
import type { IEmpresasRepository } from "../../repositories/IEmpresasRepository";

/** GET /api/empresas/me: o 404 é o sinal para o front mandar a empresa completar o cadastro. */
@injectable()
export class FindEmpresaByUsuarioService {
  constructor(@inject("EmpresasRepository") private empresasRepository: IEmpresasRepository) {}

  async execute(usuarioId: number): Promise<Empresa> {
    const empresa = await this.empresasRepository.findByUsuarioId(usuarioId);
    if (!empresa) throw new NotFoundError("Empresa ainda não cadastrada.");
    return empresa;
  }
}
