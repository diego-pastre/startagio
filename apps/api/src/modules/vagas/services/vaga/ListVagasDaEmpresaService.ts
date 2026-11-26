import { inject, injectable } from "tsyringe";
import type { FiltrosMinhasVagas, Paginado, UsuarioAutenticado, VagaResumo } from "@startagio/contracts";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { empresaIdDoUsuario } from "../../utils/acesso";

/** GET /api/vagas/minhas: todas as vagas da empresa logada, em qualquer status. */
@injectable()
export class ListVagasDaEmpresaService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(usuario: UsuarioAutenticado, filtros: FiltrosMinhasVagas): Promise<Paginado<VagaResumo>> {
    return this.vagasRepository.listByEmpresa(empresaIdDoUsuario(usuario), filtros);
  }
}
