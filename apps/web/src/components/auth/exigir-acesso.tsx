import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { NivelAcesso } from "@startagio/contracts";
import { exigirNivel } from "@/lib/sessao";

// Componentes de servidor que leem a sessão. Sempre usar dentro de um <Suspense>.

/** Só renderiza o conteúdo para o perfil informado. */
export async function ExigirNivel({ nivel, children }: { nivel: NivelAcesso; children: ReactNode }) {
  await exigirNivel(nivel);
  return children;
}

/** Empresa só cria e gerencia vagas depois de preencher a ficha jurídica (Tela 1 do PDF). */
export async function ExigirEmpresaCadastrada({ children }: { children: ReactNode }) {
  const usuario = await exigirNivel("EMPRESA");
  if (!usuario.empresa) redirect("/empresa/perfil");
  return children;
}
