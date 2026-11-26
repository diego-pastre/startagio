import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { COOKIE_SESSAO, type NivelAcesso, type UsuarioAutenticado } from "@startagio/contracts";
import { inicioDoPerfil } from "./rotas";

const API_URL = process.env.API_URL ?? "http://localhost:3333";

// Lê o cookie da requisição, então quem chama precisa estar dentro de um <Suspense>
// (regra do Cache Components). O cache() evita repetir a consulta na mesma requisição.

/** Usuário da sessão, consultado na API (GET /api/auth/me). null se não houver sessão válida. */
export const getUsuarioAtual = cache(async (): Promise<UsuarioAutenticado | null> => {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  const resposta = await fetch(`${API_URL}/api/auth/me`, {
    headers: { cookie: `${COOKIE_SESSAO}=${token}` },
  });
  if (resposta.status === 401) return null;
  if (!resposta.ok) throw new Error(`A API respondeu ${resposta.status} ao consultar a sessão.`);

  return (await resposta.json()) as UsuarioAutenticado;
});

/** Garante que há alguém logado; senão manda para o login. */
export async function exigirUsuario(): Promise<UsuarioAutenticado> {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");
  return usuario;
}

/** Garante o perfil da área; quem for de outro perfil volta para a própria tela inicial. */
export async function exigirNivel(nivel: NivelAcesso): Promise<UsuarioAutenticado> {
  const usuario = await exigirUsuario();
  if (usuario.nivel_acesso !== nivel) redirect(inicioDoPerfil(usuario));
  return usuario;
}
