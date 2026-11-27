import { inject, injectable } from "tsyringe";
import type { UsuarioAutenticado, VagaDetalhe } from "@startagio/contracts";
import type { ICandidaturasRepository } from "@modules/candidaturas/repositories/ICandidaturasRepository";
import { NotFoundError } from "@shared/errors/AppError";
import type { IVagasRepository } from "../../repositories/IVagasRepository";
import { podeVerVaga } from "../../utils/acesso";

/** GET /api/vagas/:id: detalhe completo, com perfil desejado, cursos e resumo da prova. */
@injectable()
export class FindVagaService {
  constructor(
    @inject("VagasRepository") private vagasRepository: IVagasRepository,
    @inject("CandidaturasRepository") private candidaturasRepository: ICandidaturasRepository,
  ) {}

  async execute(usuario: UsuarioAutenticado, id: number): Promise<VagaDetalhe> {
    const vaga = await this.vagasRepository.findById(id);
    // Quem não pode ver recebe o mesmo 404 de uma vaga inexistente, para não revelar rascunhos de outras empresas.
    if (!vaga || !podeVerVaga(usuario, vaga)) throw new NotFoundError("Vaga não encontrada.");

    // Tela 3 do PDF: o estudante que já fez a prova vê a nota e o status no lugar do botão.
    if (!usuario.permissoes.pode_candidatar) return vaga;
    const candidatura = await this.candidaturasRepository.findByVagaEEstudante(id, usuario.id);
    return {
      ...vaga,
      minha_candidatura: candidatura && {
        id: candidatura.id,
        nota_obtida: candidatura.nota_obtida,
        status_aprovacao: candidatura.status_aprovacao,
      },
    };
  }
}
