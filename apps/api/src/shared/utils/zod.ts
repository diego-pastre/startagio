import type { ZodError } from "zod";

/** Primeira mensagem de erro de cada campo, no formato { campo: mensagem }. */
export function camposComErro(erro: ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = issue.path.join(".");
    if (campo && !campos[campo]) campos[campo] = issue.message;
  }
  return campos;
}
