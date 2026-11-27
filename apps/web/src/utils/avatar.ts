// Avatares sem foto: iniciais do nome sobre uma cor que sai do próprio nome. Funções puras, testadas em avatar.test.ts.

/** "Ana Souza (demo)" → "AS": só conta as palavras que começam com letra. */
export function iniciais(nome: string): string {
  const partes = nome.split(/\s+/).filter((parte) => /^\p{L}/u.test(parte));
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

/**
 * Matiz (0 a 359) do avatar. O mesmo nome dá sempre a mesma cor, então a empresa
 * fica reconhecível no mural sem precisar de logo.
 */
export function matizDoNome(nome: string): number {
  let hash = 0;
  for (const caractere of nome.trim().toLowerCase()) {
    hash = (hash * 31 + caractere.codePointAt(0)!) % 360_000;
  }
  return hash % 360;
}
