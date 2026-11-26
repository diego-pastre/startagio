import type { CadastroUsuarioData, NivelAcesso, Permissoes, UsuarioAutenticado } from "@startagio/contracts";

/** Dados gravados em usuarios: o cadastro validado, com a senha já em hash e a data convertida. */
export type CreateUsuarioDTO = Omit<CadastroUsuarioData, "data_nascimento"> & { data_nascimento: Date };

/** Usuário com a linha de permissoes e o vínculo com empresas (query da seção 6.1 do PDF). */
export interface UsuarioComAcessoDTO {
  id: number;
  usuario: string;
  senha: string;
  nome_completo: string;
  email: string;
  cpf: string;
  nivel_acesso: NivelAcesso;
  permissoes: Permissoes;
  empresa: { id: number; nome_fantasia: string } | null;
}

export type ConflitoUsuarioDTO = Pick<UsuarioComAcessoDTO, "usuario" | "email" | "cpf">;

export interface SessaoDTO {
  usuario: UsuarioAutenticado;
  token: string;
}
