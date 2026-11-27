import { inject, injectable } from "tsyringe";
import {
  NOTA_MINIMA_PADRAO,
  type FiltrosCandidatos,
  type RankingDaVaga,
  type UsuarioAutenticado,
} from "@startagio/contracts";
import type { IVagasRepository } from "@modules/vagas/repositories/IVagasRepository";
import { empresaIdDoUsuario } from "@modules/vagas/utils/acesso";
import { NotFoundError } from "@shared/errors/AppError";
import type { ICandidaturasRepository } from "../../repositories/ICandidaturasRepository";

/**
 * GET /api/vagas/:id/candidatos: ranking da vaga (Tela 4 do PDF), só para a empresa dona.
 * O contato do estudante (CPF, e-mail, telefone) só aparece aqui, para quem publicou a vaga.
 */
@injectable()
export class ListCandidatosService {
  constructor(
    @inject("VagasRepository") private vagasRepository: IVagasRepository,
    @inject("CandidaturasRepository") private candidaturasRepository: ICandidaturasRepository,
  ) {}

  async execute(usuario: UsuarioAutenticado, vagaId: number, filtros: FiltrosCandidatos): Promise<RankingDaVaga> {
    const empresaId = empresaIdDoUsuario(usuario);
    const vaga = await this.vagasRepository.findById(vagaId);
    if (!vaga || vaga.empresa.id !== empresaId) throw new NotFoundError("Vaga não encontrada.");

    const { contagem, candidatos } = await this.candidaturasRepository.listByVaga(vagaId, filtros);
    return {
      vaga: { id: vaga.id, titulo: vaga.titulo, status: vaga.status },
      nota_minima_aprovacao: vaga.questionario?.nota_minima_aprovacao ?? NOTA_MINIMA_PADRAO,
      contagem,
      candidatos,
    };
  }
}
