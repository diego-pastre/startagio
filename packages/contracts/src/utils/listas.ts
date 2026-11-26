// O PDF guarda habilidades e competências como texto separado por vírgula (seção 3.5),
// e requisitos como texto com um item por linha. Estas funções fazem a ida e a volta.

/** "PHP, sql , Git,php" → ["PHP", "sql", "Git"]: sem vazios e sem repetidos (ignorando maiúsculas). */
export function separarTags(texto: string | null | undefined): string[] {
  const vistas = new Set<string>();
  const tags: string[] = [];
  for (const parte of (texto ?? "").split(",")) {
    const tag = parte.trim().replace(/\s+/g, " ");
    const chave = tag.toLocaleLowerCase("pt-BR");
    if (tag && !vistas.has(chave)) {
      vistas.add(chave);
      tags.push(tag);
    }
  }
  return tags;
}

export function juntarTags(tags: readonly string[]): string {
  return tags.join(", ");
}

/** Texto com um item por linha → lista, sem linhas vazias e sem marcadores ("- ", "• "). */
export function separarLinhas(texto: string | null | undefined): string[] {
  return (texto ?? "")
    .split(/\r?\n/)
    .map((linha) => linha.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}
