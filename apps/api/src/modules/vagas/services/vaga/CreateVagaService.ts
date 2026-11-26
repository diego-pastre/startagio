import { inject, injectable } from "tsyringe";
import type { NovaVagaData, UsuarioAutenticado, VagaDetalhe } from "@startagio/contracts";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { empresaIdDoUsuario } from "../../utils/acesso";

/** POST /api/vagas: o empresa_id vem da sessão, nunca do corpo da requisição (seção 3.4 do PDF). */
@injectable()
export class CreateVagaService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(usuario: UsuarioAutenticado, data: NovaVagaData): Promise<VagaDetalhe> {
    return this.vagasRepository.create(empresaIdDoUsuario(usuario), data);
  }
}
