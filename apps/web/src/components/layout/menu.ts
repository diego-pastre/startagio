import type { NivelAcesso, Permissao, UsuarioAutenticado } from "@startagio/contracts";

interface ItemMenu {
  href: string;
  label: string;
  /** Aparece para quem tem esta flag na tabela permissoes. */
  permissao?: Permissao;
  /** Aparece só para este perfil. */
  nivel?: NivelAcesso;
}

// Matriz de telas por permissão da seção 4.1 do PDF.
const ITENS: ItemMenu[] = [
  { href: "/estudante/vagas", label: "Vagas", permissao: "pode_candidatar" },
  { href: "/estudante/minhas-candidaturas", label: "Minhas candidaturas", permissao: "pode_candidatar" },
  { href: "/empresa/vagas", label: "Minhas vagas", permissao: "pode_criar_vagas" },
  { href: "/empresa/perfil", label: "Dados da empresa", nivel: "EMPRESA" },
  { href: "/instituicao/validacoes", label: "Validações", permissao: "pode_validar_estagio" },
];

export function menuDoUsuario(usuario: UsuarioAutenticado): ItemMenu[] {
  return ITENS.filter(
    (item) =>
      (!item.permissao || usuario.permissoes[item.permissao]) && (!item.nivel || usuario.nivel_acesso === item.nivel),
  );
}
