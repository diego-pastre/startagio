import { enunciadoSchema, type Enunciado } from "@startagio/contracts";

/** Lê o JSON da coluna questoes.enunciado (convenção da seção 6.3 do PDF). */
export function lerEnunciado(texto: string): Enunciado {
  return enunciadoSchema.parse(JSON.parse(texto));
}
