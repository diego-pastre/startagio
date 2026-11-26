import type { ConflitoUsuarioDTO, CreateUsuarioDTO, UsuarioComAcessoDTO } from "../dto/UsuarioDTO";

export interface IUsuariosRepository {
  create(data: CreateUsuarioDTO): Promise<UsuarioComAcessoDTO>;
  findById(id: number): Promise<UsuarioComAcessoDTO | null>;
  /** Busca pelo login (usuario) ou pelo e-mail. */
  findByLogin(login: string): Promise<UsuarioComAcessoDTO | null>;
  /** Usuários que já usam o mesmo login, e-mail ou CPF. */
  findConflitos(data: ConflitoUsuarioDTO): Promise<ConflitoUsuarioDTO[]>;
}
