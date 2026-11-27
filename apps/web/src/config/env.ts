import { z } from "zod";

/**
 * Variáveis de ambiente do site. Só o servidor do Next usa: nenhuma leva o prefixo NEXT_PUBLIC_.
 * Em produção, faltar alguma derruba o build e o start com uma mensagem clara, em vez de o site
 * subir apontando para o localhost. Em desenvolvimento, o padrão serve para a API local.
 */
const producao = process.env.NODE_ENV === "production";

const envSchema = z.object({
  API_URL: producao
    ? z.url({ message: "Defina API_URL com o endereço da API (ex.: http://api.railway.internal:3333)" })
    : z.url().default("http://localhost:3333"),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error("Variáveis de ambiente do site inválidas:", z.flattenError(resultado.error).fieldErrors);
  throw new Error("Variáveis de ambiente do site inválidas (confira apps/web/.env ou o painel da hospedagem)");
}

/** Endereço da API Express, sem a barra no fim. */
export const API_URL = resultado.data.API_URL.replace(/\/+$/, "");
