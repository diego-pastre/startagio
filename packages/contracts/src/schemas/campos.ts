import { z } from "zod";
import { somenteDigitos } from "../utils/documentos";
import { juntarTags, separarTags } from "../utils/listas";
import { lerMoeda } from "../utils/mascaras";

// Blocos reaproveitados pelos schemas. Os limites seguem o dicionário de dados do PDF (seção 3).
//
// O mesmo schema roda duas vezes: no formulário (entrada em texto) e na API (entrada já convertida
// pelo formulário). Por isso cada bloco aceita a própria saída como entrada: "30" e 30 dão 30.

const OBRIGATORIO = "Campo obrigatório";

/** Texto que precisa ser preenchido. Vazio mostra "Campo obrigatório" antes de qualquer outra regra. */
export const preenchido = () => z.string({ error: OBRIGATORIO }).trim().min(1, OBRIGATORIO);

export const textoObrigatorio = (max: number) => preenchido().max(max, `Máximo de ${max} caracteres`);

/** Campo opcional: texto vazio vira null, para o banco gravar NULL. */
export const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .nullish()
    .transform((valor) => valor || null);

export const email = preenchido()
  .toLowerCase()
  .max(180, "Máximo de 180 caracteres")
  .pipe(z.email("E-mail inválido"));

/** Telefone guardado só com dígitos: DDD + 8 ou 9 dígitos. */
export const telefone = preenchido()
  .transform(somenteDigitos)
  .refine((valor) => valor.length === 10 || valor.length === 11, "Telefone inválido");

function vazio(valor: unknown): boolean {
  return valor === null || valor === undefined || (typeof valor === "string" && valor.trim() === "");
}

function paraNumero(valor: string | number): number {
  return typeof valor === "number" ? valor : Number(valor.trim().replace(",", "."));
}

const numeroInteiro = (min: number, max: number, unidade: string) => {
  const sufixo = unidade ? ` ${unidade}` : "";
  return z
    .number({ error: "Informe um número" })
    .int("Use um número inteiro")
    .min(min, `Mínimo de ${min}${sufixo}`)
    .max(max, `Máximo de ${max}${sufixo}`);
};

/** Inteiro obrigatório entre min e max (aceita "30" ou 30). */
export const inteiro = (min: number, max: number, unidade = "") =>
  z
    .union([z.number(), z.string()], { error: OBRIGATORIO })
    .transform((valor, ctx) => {
      if (vazio(valor)) {
        ctx.addIssue({ code: "custom", message: OBRIGATORIO });
        return z.NEVER;
      }
      return paraNumero(valor);
    })
    .pipe(numeroInteiro(min, max, unidade));

/** Inteiro opcional entre min e max: vazio vira null. */
export const inteiroOpcional = (min: number, max: number, unidade = "") =>
  z
    .union([z.number(), z.string()])
    .nullish()
    .transform((valor) => (vazio(valor) ? null : paraNumero(valor as string | number)))
    .pipe(numeroInteiro(min, max, unidade).nullable());

/** Dinheiro com 2 casas: aceita "1.350,00" (formulário) ou 1350 (JSON). Vazio vira 0. */
export const dinheiro = (maximo: number) =>
  z
    .union([z.number(), z.string()])
    .nullish()
    .transform((valor) => (vazio(valor) ? 0 : lerMoeda(valor as string | number)))
    .pipe(z.number({ error: "Valor inválido" }).min(0, "O valor não pode ser negativo").max(maximo, "Valor acima do limite"))
    .transform((valor) => Math.round(valor * 100) / 100);

/** Sim/não. Aceita também 1/0, como no exemplo de payload do PDF (seção 7.1). */
export const booleano = (padrao: boolean) =>
  z
    .union([z.boolean(), z.literal(0), z.literal(1)])
    .default(padrao)
    .transform((valor) => valor === true || valor === 1);

/** Data opcional no formato YYYY-MM-DD: vazio vira null. */
export const dataOpcional = () =>
  z
    .string()
    .trim()
    .nullish()
    .transform((valor) => valor || null)
    .pipe(z.iso.date("Data inválida").nullable());

/** Lista separada por vírgula, normalizada ("sql,  Git ,sql" → "sql, Git"). Vazio vira null. */
export const tags = (max: number) =>
  textoOpcional(max).transform((texto) => (texto ? juntarTags(separarTags(texto)) || null : null));
