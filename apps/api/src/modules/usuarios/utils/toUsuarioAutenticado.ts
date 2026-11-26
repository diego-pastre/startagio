import type { UsuarioAutenticado } from "@startagio/contracts";
import type { UsuarioComAcessoDTO } from "../dto/UsuarioDTO";

/** O que pode sair na resposta da API: sem senha e sem CPF. */
export function toUsuarioAutenticado(usuario: UsuarioComAcessoDTO): UsuarioAutenticado {
  return {
    id: usuario.id,
    usuario: usuario.usuario,
    nome_completo: usuario.nome_completo,
    email: usuario.email,
    nivel_acesso: usuario.nivel_acesso,
    permissoes: usuario.permissoes,
    empresa: usuario.empresa,
  };
}
