import type { CadastroUsuarioData, LoginData, UsuarioAutenticado } from "@startagio/contracts";
import { api } from "@/lib/api";

export async function entrar(dados: LoginData): Promise<UsuarioAutenticado> {
  const { data } = await api.post<UsuarioAutenticado>("/auth/login", dados);
  return data;
}

export async function cadastrar(dados: CadastroUsuarioData): Promise<UsuarioAutenticado> {
  const { data } = await api.post<UsuarioAutenticado>("/auth/register", dados);
  return data;
}

export async function sair(): Promise<void> {
  await api.post("/auth/logout");
}
