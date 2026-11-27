// Textos de exibição da prova e das candidaturas. Funções puras, testadas em candidaturas.test.ts.

/** 7.5 → "7,50": nota de 0 a 10 sempre com duas casas, como o PDF escreve ("Nota: X.XX"). */
export function formatarNota(nota: number): string {
  return nota.toFixed(2).replace(".", ",");
}

export type FaixaDeAfinidade = "alta" | "media" | "baixa";

/** Afinidade de 0 a 100 em três faixas, para colorir e rotular. null quando não foi calculada. */
export function faixaDeAfinidade(afinidade: number | null): FaixaDeAfinidade | null {
  if (afinidade === null) return null;
  if (afinidade >= 75) return "alta";
  if (afinidade >= 50) return "media";
  return "baixa";
}

export const ROTULO_AFINIDADE: Record<FaixaDeAfinidade, string> = {
  alta: "Afinidade alta",
  media: "Afinidade média",
  baixa: "Afinidade baixa",
};

/** "3 de 5 respondidas" e a porcentagem para a barra de progresso. */
export function progressoDaProva(respondidas: number, total: number) {
  const porcentagem = total > 0 ? Math.round((respondidas / total) * 100) : 0;
  return { texto: `${respondidas} de ${total} ${total === 1 ? "respondida" : "respondidas"}`, porcentagem };
}
