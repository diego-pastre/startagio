import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { camposDoErro } from "./api";

/** Marca no formulário os campos que a API recusou. Devolve false se o erro não trouxe campos. */
export function aplicarErrosDaApi<T extends FieldValues>(setError: UseFormSetError<T>, erro: unknown): boolean {
  const campos = Object.entries(camposDoErro(erro) ?? {});
  for (const [campo, mensagem] of campos) {
    setError(campo as Path<T>, { type: "server", message: mensagem });
  }
  return campos.length > 0;
}
