import { inject, injectable } from "tsyringe";
import { hojeISO, type FiltrosVagas, type Paginado, type VagaResumo } from "@startagio/contracts";
import type { IVagasRepository } from "../../repositories/IVagasRepository";

/** GET /api/vagas: mural do estudante, só com vagas abertas e no prazo (Tela 3 do PDF). */
@injectable()
export class ListVagasAbertasService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(filtros: FiltrosVagas): Promise<Paginado<VagaResumo>> {
    return this.vagasRepository.listAbertas(filtros, hojeISO());
  }
}
