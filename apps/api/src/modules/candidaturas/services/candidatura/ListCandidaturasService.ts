import { inject, injectable } from "tsyringe";
import type { Candidatura, FiltrosCandidaturas, Paginado, UsuarioAutenticado } from "@startagio/contracts";
import type { ICandidaturasRepository } from "../../repositories/ICandidaturasRepository";

/** GET /api/candidaturas: "Minhas candidaturas" do estudante logado (Tela da seção 4.1 do PDF). */
@injectable()
export class ListCandidaturasService {
  constructor(@inject("CandidaturasRepository") private candidaturasRepository: ICandidaturasRepository) {}

  execute(usuario: UsuarioAutenticado, filtros: FiltrosCandidaturas): Promise<Paginado<Candidatura>> {
    return this.candidaturasRepository.listByEstudante(usuario.id, filtros);
  }
}
