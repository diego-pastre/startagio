import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { matizDoNome } from "@/utils/avatar";

interface FitaProps {
  /** Texto que define a cor (ex.: a área da vaga): o mesmo texto sempre dá a mesma fita. */
  cor?: string;
  /** Matiz fixa (0 a 359), para fitas que não dependem de texto. */
  matiz?: number;
  /** Inclinação em graus. */
  giro?: number;
  className?: string;
}

/** Pedaço de fita adesiva que "prende" um cartaz no mural (classe `fita` em globals.css). */
export function Fita({ cor, matiz, giro, className }: FitaProps) {
  const matizFinal = matiz ?? (cor ? matizDoNome(cor) : 100);
  // Amarelo claro só parece amarelo com bastante cor; com pouca, vira cáqui.
  const amarelo = matizFinal >= 70 && matizFinal <= 125;
  const estilo = {
    "--matiz": matizFinal,
    ...(amarelo && { "--fita-croma": 0.17 }),
    ...(giro !== undefined && { rotate: `${giro}deg` }),
  } as CSSProperties;
  return <span aria-hidden className={cn("fita", className)} style={estilo} />;
}
