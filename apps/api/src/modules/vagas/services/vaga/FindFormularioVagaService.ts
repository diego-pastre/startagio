import { inject, injectable } from "tsyringe";
import type { FormularioDaVaga, UsuarioAutenticado } from "@startagio/contracts";
import { NotFoundError } from "@shared/errors/AppError";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { empresaIdDoUsuario } from "../../utils/acesso";

/** GET /api/vagas/:id/formulario: a vaga completa, com o gabarito, só para a empresa dona editar. */
@injectable()
export class FindFormularioVagaService {
  constructor(@inject("VagasRepository") private vagasRepository: IVagasRepository) {}

  async execute(usuario: UsuarioAutenticado, id: number): Promise<FormularioDaVaga> {
    const empresaId = empresaIdDoUsuario(usuario);
    const vaga = await this.vagasRepository.findById(id);
    // Outra empresa recebe o mesmo 404 de uma vaga inexistente: o gabarito nunca sai daqui para terceiros.
    if (!vaga || vaga.empresa.id !== empresaId) throw new NotFoundError("Vaga não encontrada.");

    const dados = await this.vagasRepository.findFormulario(id);
    if (!dados) throw new NotFoundError("Vaga não encontrada.");
    return { dados, prova_travada: vaga.total_candidaturas > 0 };
  }
}
