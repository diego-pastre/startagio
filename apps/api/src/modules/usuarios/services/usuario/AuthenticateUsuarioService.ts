import { inject, injectable } from "tsyringe";
import type { LoginData } from "@startagio/contracts";
import { UnauthorizedError } from "@shared/errors/AppError";
import type { IHashProvider } from "@shared/providers/HashProvider/IHashProvider";
import type { ITokenProvider } from "@shared/providers/TokenProvider/ITokenProvider";
import type { SessaoDTO } from "../../dto/UsuarioDTO";
import type { IUsuariosRepository } from "../../repositories/IUsuariosRepository";
import { toUsuarioAutenticado } from "../../utils/toUsuarioAutenticado";

/** POST /api/auth/login: confere login (usuário ou e-mail) e senha. */
@injectable()
export class AuthenticateUsuarioService {
  constructor(
    @inject("UsuariosRepository") private usuariosRepository: IUsuariosRepository,
    @inject("HashProvider") private hashProvider: IHashProvider,
    @inject("TokenProvider") private tokenProvider: ITokenProvider,
  ) {}

  async execute({ login, senha }: LoginData): Promise<SessaoDTO> {
    const usuario = await this.usuariosRepository.findByLogin(login);
    const senhaConfere = usuario ? await this.hashProvider.compare(senha, usuario.senha) : false;

    // Mesma mensagem para login inexistente e senha errada, para não revelar quais contas existem.
    if (!usuario || !senhaConfere) throw new UnauthorizedError("Usuário ou senha inválidos.");

    return { usuario: toUsuarioAutenticado(usuario), token: this.tokenProvider.sign(usuario.id) };
  }
}
