import {
  BriefcaseBusinessIcon,
  Building2Icon,
  ClipboardCheckIcon,
  SearchIcon,
  SendIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import type { NivelAcesso, Permissao, UsuarioAutenticado } from "@startagio/contracts";

export interface ItemMenu {
  href: string;
  label: string;
  /** Rótulo curto, para a barra do topo e a barra de baixo do celular. */
  curto: string;
  icone: LucideIcon;
  /** Aparece para quem tem esta flag na tabela permissoes. */
  permissao?: Permissao;
  /** Aparece só para este perfil. */
  nivel?: NivelAcesso;
}

// Matriz de telas por permissão da seção 4.1 do PDF.
const ITENS: ItemMenu[] = [
  { href: "/estudante/vagas", label: "Vagas", curto: "Vagas", icone: SearchIcon, permissao: "pode_candidatar" },
  {
    href: "/estudante/minhas-candidaturas",
    label: "Minhas candidaturas",
    curto: "Candidaturas",
    icone: SendIcon,
    permissao: "pode_candidatar",
  },
  { href: "/estudante/perfil", label: "Meu perfil", curto: "Perfil", icone: UserRoundIcon, nivel: "ESTUDANTE" },
  {
    href: "/empresa/vagas",
    label: "Minhas vagas",
    curto: "Vagas",
    icone: BriefcaseBusinessIcon,
    permissao: "pode_criar_vagas",
  },
  { href: "/empresa/perfil", label: "Dados da empresa", curto: "Empresa", icone: Building2Icon, nivel: "EMPRESA" },
  {
    href: "/instituicao/validacoes",
    label: "Validações",
    curto: "Validações",
    icone: ClipboardCheckIcon,
    permissao: "pode_validar_estagio",
  },
];

export function menuDoUsuario(usuario: UsuarioAutenticado): ItemMenu[] {
  return ITENS.filter(
    (item) =>
      (!item.permissao || usuario.permissoes[item.permissao]) && (!item.nivel || usuario.nivel_acesso === item.nivel),
  );
}
