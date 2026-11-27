import type { ReactNode } from "react";

interface CabecalhoDaPaginaProps {
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Botões à direita do título (ex.: "Nova vaga"). */
  acoes?: ReactNode;
}

/** Título grande da página, na Bricolage, com um filete embaixo separando do conteúdo. */
export function CabecalhoDaPagina({ titulo, descricao, acoes }: CabecalhoDaPaginaProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b pb-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-[2rem] leading-[1.05] font-bold text-balance sm:text-[2.6rem]">{titulo}</h1>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </header>
  );
}
