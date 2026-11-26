import { inject, injectable } from "tsyringe";
import type { EmpresaData } from "@startagio/contracts";
import { ConflictError } from "@shared/errors/AppError";
import type { Empresa } from "@shared/infra/prisma/models";
import type { IEmpresasRepository } from "../../repositories/IEmpresasRepository";
import { MENSAGEM_CNPJ_DUPLICADO } from "../../utils/mensagens";

/** POST /api/empresas: ficha jurídica da empresa, obrigatória antes de publicar vagas (Tela 1 do PDF). */
@injectable()
export class CreateEmpresaService {
  constructor(@inject("EmpresasRepository") private empresasRepository: IEmpresasRepository) {}

  async execute(usuarioId: number, data: EmpresaData): Promise<Empresa> {
    if (await this.empresasRepository.findByUsuarioId(usuarioId)) {
      throw new ConflictError("Os dados da sua empresa já foram cadastrados.");
    }

    if (await this.empresasRepository.findByCnpj(data.cnpj)) {
      throw new ConflictError(MENSAGEM_CNPJ_DUPLICADO, { cnpj: MENSAGEM_CNPJ_DUPLICADO });
    }

    return this.empresasRepository.create(usuarioId, data);
  }
}
