import type { PerfilEstudante, PerfilEstudanteData } from "@startagio/contracts";
import { api, statusDoErro } from "@/lib/api";

/** Perfil acadêmico do estudante logado, ou null se ainda não foi preenchido (404). */
export async function buscarMeuPerfil(): Promise<PerfilEstudante | null> {
  try {
    const { data } = await api.get<PerfilEstudante>("/estudantes/perfil");
    return data;
  } catch (erro) {
    if (statusDoErro(erro) === 404) return null;
    throw erro;
  }
}

export async function salvarMeuPerfil(dados: PerfilEstudanteData): Promise<PerfilEstudante> {
  const { data } = await api.put<PerfilEstudante>("/estudantes/perfil", dados);
  return data;
}
