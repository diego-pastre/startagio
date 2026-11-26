import { inject, injectable } from "tsyringe";
import type { CadastroUsuarioData } from "@startagio/contracts";
import { ConflictError } from "@shared/errors/AppError";
import type { IHashProvider } from "@shared/providers/HashProvider/IHashProvider";
import type { ITokenProvider } from "@shared/providers/TokenProvider/ITokenProvider";
import { paraDataDoBanco } from "@shared/utils/datas";
import type { SessaoDTO } from "../../dto/UsuarioDTO";
import type { IUsuariosRepository } from "../../repositories/IUsuariosRepository";
import { toUsuarioAutenticado } from "../../utils/toUsuarioAutenticado";

/** POST /api/auth/register: cria o usuário e já abre a sessão. */
@injectable()
export class RegisterUsuarioService {
  constructor(
    @inject("UsuariosRepository") private usuariosRepository: IUsuariosRepository,
    @inject("HashProvider") private hashProvider: IHashProvider,
    @inject("TokenProvider") private tokenProvider: ITokenProvider,
  ) {}

  async execute(data: CadastroUsuarioData): Promise<SessaoDTO> {
    const conflitos = await this.usuariosRepository.findConflitos(data);
    const campos: Record<string, string> = {};
    for (const conflito of conflitos) {
      if (conflito.usuario === data.usuario) campos.usuario = "Este usuário já está em uso.";
      if (conflito.email === data.email) campos.email = "Este e-mail já possui cadastro.";
      if (conflito.cpf === data.cpf) campos.cpf = "Este CPF já possui cadastro.";
    }
    if (Object.keys(campos).length > 0) {
      throw new ConflictError("Já existe uma conta com estes dados.", campos);
    }

    const usuario = await this.usuariosRepository.create({
      ...data,
      senha: await this.hashProvider.hash(data.senha),
      data_nascimento: paraDataDoBanco(data.data_nascimento),
    });

    return { usuario: toUsuarioAutenticado(usuario), token: this.tokenProvider.sign(usuario.id) };
  }
}
