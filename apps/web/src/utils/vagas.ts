import { formatarMoeda, hojeISO, NIVEL_IDIOMA_LABEL, type CursoDaVaga, type PerfilDesejado } from "@startagio/contracts";

// Textos de exibição das vagas. Funções puras, testadas em vagas.test.ts.

/** "Do 3º ao 7º semestre", "A partir do 5º semestre"... null quando a vaga não restringe o semestre. */
export function faixaDeSemestres(minimo: number | null, maximo: number | null): string | null {
  if (minimo && maximo) return minimo === maximo ? `${minimo}º semestre` : `Do ${minimo}º ao ${maximo}º semestre`;
  // Mínimo 1 é o padrão do banco: na prática não restringe nada.
  if (minimo && minimo > 1) return `A partir do ${minimo}º semestre`;
  if (maximo) return `Até o ${maximo}º semestre`;
  return null;
}

export function textoDaBolsa(valor: number): string {
  return valor > 0 ? `${formatarMoeda(valor)}/mês` : "Sem bolsa";
}

/** "Inglês (básico)". null quando a vaga não exige idioma. */
export function textoDoIdioma({ idioma_exigido, nivel_idioma }: Pick<PerfilDesejado, "idioma_exigido" | "nivel_idioma">) {
  if (!idioma_exigido) return null;
  return nivel_idioma ? `${idioma_exigido} (${NIVEL_IDIOMA_LABEL[nivel_idioma].toLowerCase()})` : idioma_exigido;
}

/** A data limite (YYYY-MM-DD) já passou? Compara com hoje no horário de Brasília. */
export function inscricoesEncerradas(dataLimite: string | null, hoje: string = hojeISO()): boolean {
  return dataLimite !== null && dataLimite < hoje;
}

/** Para o card: os primeiros cursos e quantos ficaram de fora. */
export function resumirCursos(cursos: CursoDaVaga[], limite = 3) {
  return { visiveis: cursos.slice(0, limite), restantes: Math.max(0, cursos.length - limite) };
}

/** Lista de opções de um <Select> a partir de um mapa de rótulos (ex.: TIPO_MODELO_LABEL). */
export function opcoesDe<T extends string>(rotulos: Record<T, string>) {
  return (Object.keys(rotulos) as T[]).map((valor) => ({ valor, rotulo: rotulos[valor] }));
}
