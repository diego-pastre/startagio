import type { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import { COOKIE_SESSAO } from "@startagio/contracts";
import { FindUsuarioAutenticadoService } from "@modules/usuarios/services/usuario/FindUsuarioAutenticadoService";
import { UnauthorizedError } from "@shared/errors/AppError";
import type { ITokenProvider } from "@shared/providers/TokenProvider/ITokenProvider";

export async function ensureAuthenticated(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token: unknown = req.cookies?.[COOKIE_SESSAO];
  if (typeof token !== "string" || !token) throw new UnauthorizedError();

  const usuarioId = container.resolve<ITokenProvider>("TokenProvider").verify(token);
  if (!usuarioId) throw new UnauthorizedError("Sessão expirada. Faça login novamente.");

  req.usuario = await container.resolve(FindUsuarioAutenticadoService).execute(usuarioId);
  next();
}
