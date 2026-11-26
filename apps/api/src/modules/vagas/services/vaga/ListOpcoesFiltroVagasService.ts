import { inject, injectable } from "tsyringe";
import { hojeISO, type OpcoesFiltroVagas } from "@startagio/contracts";
import type { IVagasRepository } from "../../repositories/IVagasRepository";

/** GET /api/vagas/filtros: áreas e cursos das vagas abertas, para montar os filtros do mural. */
@injectable()
export class ListOpcoesFiltroVagasService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(): Promise<OpcoesFiltroVagas> {
    return this.vagasRepository.listOpcoesFiltro(hojeISO());
  }
}
