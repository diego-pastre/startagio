import { inject, injectable } from "tsyringe";
import type { EmpresaData } from "@startagio/contracts";
import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import type { Empresa } from "@shared/infra/prisma/models";
import type { IEmpresasRepository } from "../../repositories/IEmpresasRepository";
import { MENSAGEM_CNPJ_DUPLICADO } from "../../utils/mensagens";

/** PUT /api/empresas/me */
@injectable()
export class UpdateEmpresaService {
  constructor(@inject("EmpresasRepository") private empresasRepository: IEmpresasRepository) {}

  async execute(usuarioId: number, data: EmpresaData): Promise<Empresa> {
    const empresa = await this.empresasRepository.findByUsuarioId(usuarioId);
    if (!empresa) throw new NotFoundError("Empresa ainda não cadastrada.");

    if (data.cnpj !== empresa.cnpj) {
      const outra = await this.empresasRepository.findByCnpj(data.cnpj);
      if (outra && outra.id !== empresa.id) {
        throw new ConflictError(MENSAGEM_CNPJ_DUPLICADO, { cnpj: MENSAGEM_CNPJ_DUPLICADO });
      }
    }

    return this.empresasRepository.update(empresa.id, data);
  }
}
