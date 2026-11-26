import axios from "axios";
import type { ApiErro } from "@startagio/contracts";

/** Cliente HTTP do navegador. O Next repassa /api/* para a API Express (next.config.ts). */
export const api = axios.create({ baseURL: "/api" });

export function statusDoErro(erro: unknown): number | undefined {
  return axios.isAxiosError(erro) ? erro.response?.status : undefined;
}

export function mensagemDeErro(erro: unknown, padrao = "Não foi possível concluir. Tente novamente."): string {
  if (axios.isAxiosError<ApiErro>(erro)) {
    if (!erro.response) return "Sem conexão com o servidor. Confira se a API está rodando.";
    return erro.response.data?.mensagem ?? padrao;
  }
  return padrao;
}

/** Mensagens por campo devolvidas pela API (422 de validação e 409 de duplicidade). */
export function camposDoErro(erro: unknown): Record<string, string> | undefined {
  return axios.isAxiosError<ApiErro>(erro) ? erro.response?.data?.campos : undefined;
}
