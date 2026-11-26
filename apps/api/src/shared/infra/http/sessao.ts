import type { CookieOptions, Request, Response } from "express";
import { COOKIE_SESSAO, type UsuarioAutenticado } from "@startagio/contracts";
import { env } from "@config/env";
import { UnauthorizedError } from "@shared/errors/AppError";

function opcoesDoCookie(): CookieOptions {
  return { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/" };
}

export function definirCookieSessao(res: Response, token: string): void {
  res.cookie(COOKIE_SESSAO, token, { ...opcoesDoCookie(), maxAge: env.JWT_EXPIRES_IN_HORAS * 60 * 60 * 1000 });
}

export function limparCookieSessao(res: Response): void {
  res.clearCookie(COOKIE_SESSAO, opcoesDoCookie());
}

/** Usuário colocado na requisição pelo ensureAuthenticated. */
export function usuarioDaRequisicao(req: Request): UsuarioAutenticado {
  if (!req.usuario) throw new UnauthorizedError();
  return req.usuario;
}
