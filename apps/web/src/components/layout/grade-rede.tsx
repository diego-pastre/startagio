import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradeRedeProps {
  /** Coluna da esquerda (normalmente o <CartaoPerfil> e, no mural, os filtros). */
  esquerda?: ReactNode;
  /** Coluna da direita: dicas e atalhos. Só aparece a partir de 1280px. */
  direita?: ReactNode;
  children: ReactNode;
}

/**
 * Layout em três colunas de rede social: perfil | conteúdo | dicas.
 * No celular fica uma coluna só, na ordem esquerda → conteúdo; a direita some.
 */
export function GradeRede({ esquerda, direita, children }: GradeRedeProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-6",
        esquerda && "lg:grid-cols-[232px_minmax(0,1fr)]",
        esquerda && direita && "xl:grid-cols-[232px_minmax(0,1fr)_288px]",
        !esquerda && direita && "xl:grid-cols-[minmax(0,1fr)_288px]",
      )}
    >
      {esquerda && <aside className="flex flex-col gap-4 lg:sticky lg:top-22">{esquerda}</aside>}
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
      {direita && <aside className="hidden flex-col gap-4 xl:sticky xl:top-22 xl:flex">{direita}</aside>}
    </div>
  );
}
