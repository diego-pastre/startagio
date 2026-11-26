import { inject, injectable } from "tsyringe";
import type { UsuarioAutenticado } from "@startagio/contracts";
import { UnauthorizedError } from "@shared/errors/AppError";
import type { IUsuariosRepository } from "../../repositories/IUsuariosRepository";
import { toUsuarioAutenticado } from "../../utils/toUsuarioAutenticado";

/** Carrega o usuário da sessão com as permissões atuais (mudar a tabela permissoes vale na hora). */
@injectable()
export class FindUsuarioAutenticadoService {
  constructor(@inject("UsuariosRepository") private usuariosRepository: IUsuariosRepository) {}

  async execute(usuarioId: number): Promise<UsuarioAutenticado> {
    const usuario = await this.usuariosRepository.findById(usuarioId);
    if (!usuario) throw new UnauthorizedError("Sessão expirada. Faça login novamente.");
    return toUsuarioAutenticado(usuario);
  }
}
