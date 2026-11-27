import { NIVEIS_IDIOMA, type CursoDaVaga, type NivelIdioma, type PerfilDesejado, type PerfilEstudante } from "@startagio/contracts";

// Afinidade de 0 a 100 (seção 6.3 do PDF). O PDF só diz que ela combina curso, semestre e idioma
// do estudante com o desempenho na prova; a fórmula abaixo é a nossa e está em docs/banco-de-dados.md.

/** Peso da aderência ao perfil; o resto (40%) vem da nota da prova. */
export const PESO_ADERENCIA = 0.6;
/** Pontos perdidos por semestre fora da faixa pedida. */
const PERDA_POR_SEMESTRE = 25;
/** Pontos perdidos por nível de idioma abaixo do pedido (Básico → Fluente são 3 níveis). */
const PERDA_POR_NIVEL_DE_IDIOMA = 35;

/** "Sistemas de Informação " e "sistemas de informacao" são o mesmo curso. */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").trim().toLocaleLowerCase("pt-BR");
}

const nivelDoIdioma = (nivel: NivelIdioma | null) => (nivel ? NIVEIS_IDIOMA.indexOf(nivel) : 0);

interface EntradaAfinidade {
  estudante: Pick<PerfilEstudante, "curso" | "semestre_atual" | "idioma" | "nivel_idioma">;
  perfilDesejado: PerfilDesejado | null;
  cursos: CursoDaVaga[];
  /** Nota da prova, de 0 a 10. */
  nota: number;
}

/** Cada critério que a vaga pede vale de 0 a 100. Critério que a vaga não pede fica de fora da média. */
export function criteriosDeAderencia({ estudante, perfilDesejado, cursos }: Omit<EntradaAfinidade, "nota">): number[] {
  const criterios: number[] = [];

  if (cursos.length) {
    const curso = normalizar(estudante.curso);
    criterios.push(cursos.some((item) => normalizar(item.nome_curso) === curso) ? 100 : 0);
  }

  const minimo = perfilDesejado?.semestre_minimo ?? null;
  const maximo = perfilDesejado?.semestre_maximo ?? null;
  // Mínimo 1 é o padrão do banco: não restringe nada.
  if ((minimo !== null && minimo > 1) || maximo !== null) {
    const semestre = estudante.semestre_atual;
    let distancia = 0;
    if (minimo !== null && semestre < minimo) distancia = minimo - semestre;
    else if (maximo !== null && semestre > maximo) distancia = semestre - maximo;
    criterios.push(Math.max(0, 100 - PERDA_POR_SEMESTRE * distancia));
  }

  if (perfilDesejado?.idioma_exigido) {
    const mesmoIdioma = estudante.idioma !== null && normalizar(estudante.idioma) === normalizar(perfilDesejado.idioma_exigido);
    const niveisAbaixo = Math.max(0, nivelDoIdioma(perfilDesejado.nivel_idioma) - nivelDoIdioma(estudante.nivel_idioma));
    criterios.push(mesmoIdioma ? Math.max(0, 100 - PERDA_POR_NIVEL_DE_IDIOMA * niveisAbaixo) : 0);
  }

  return criterios;
}

/** Afinidade = 60% da aderência ao perfil + 40% do desempenho na prova, com duas casas. */
export function calcularAfinidade(entrada: EntradaAfinidade): number {
  const criterios = criteriosDeAderencia(entrada);
  // Vaga sem nenhum requisito: qualquer perfil é 100% aderente.
  const aderencia = criterios.length ? criterios.reduce((soma, valor) => soma + valor, 0) / criterios.length : 100;
  const desempenho = entrada.nota * 10;
  return Math.round((PESO_ADERENCIA * aderencia + (1 - PESO_ADERENCIA) * desempenho) * 100) / 100;
}
