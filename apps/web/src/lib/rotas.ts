import type { UsuarioAutenticado } from "@startagio/contracts";

/** Primeira tela depois do login, conforme o perfil (seção 4.1 do PDF). */
export function inicioDoPerfil(usuario: UsuarioAutenticado): string {
  switch (usuario.nivel_acesso) {
    case "ESTUDANTE":
      return "/estudante/vagas";
    case "EMPRESA":
      // Empresa sem ficha jurídica vai completar o cadastro antes de tudo (Tela 1 do PDF).
      return usuario.empresa ? "/empresa/vagas" : "/empresa/perfil";
    case "INSTITUICAO_ENSINO":
      return "/instituicao/validacoes";
  }
}
