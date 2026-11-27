import type { CSSProperties, ReactNode } from "react";
import { Fita } from "@/components/fita";
import { cn } from "@/lib/utils";

interface CartazProps {
  children: ReactNode;
  /** Texto que dá a cor da fita (ex.: a área da vaga). Sem ele, a fita é de marca-texto. */
  corDaFita?: string;
  className?: string;
  style?: CSSProperties;
}

/** Folha de papel presa no mural por um pedaço de fita: o formato das vagas, do login e do cadastro. */
export function Cartaz({ children, corDaFita, className, style }: CartazProps) {
  return (
    <div className={cn("relative rounded-[3px] border bg-card sombra-papel", className)} style={style}>
      {corDaFita ? <Fita cor={corDaFita} /> : <Fita matiz={100} />}
      {children}
    </div>
  );
}
