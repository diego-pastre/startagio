import type { UsuarioAutenticado, VagaDetalhe } from "@startagio/contracts";
import { ForbiddenError } from "@shared/errors/AppError";

/** Empresa do usuário logado. A ficha jurídica é obrigatória antes de criar vagas (Tela 1 do PDF). */
export function empresaIdDoUsuario(usuario: UsuarioAutenticado): number {
  if (!usuario.empresa) throw new ForbiddenError("Cadastre os dados da empresa antes de publicar vagas.");
  return usuario.empresa.id;
}

/**
 * Vaga aberta é visível para qualquer usuário logado. As outras (rascunho, pausada, encerrada)
 * só para a empresa dona e para a instituição de ensino, que tem leitura global (seção 1.1 do PDF).
 */
export function podeVerVaga(usuario: UsuarioAutenticado, vaga: Pick<VagaDetalhe, "status" | "empresa">): boolean {
  return vaga.status === "ABERTA" || usuario.empresa?.id === vaga.empresa.id || usuario.permissoes.pode_validar_estagio;
}
