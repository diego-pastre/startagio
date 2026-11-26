import type { NextFunction, Request, Response } from "express";
import type { NivelAcesso, Permissao } from "@startagio/contracts";
import { ForbiddenError } from "@shared/errors/AppError";
import { usuarioDaRequisicao } from "../sessao";

// Usar sempre depois do ensureAuthenticated.

/** Libera só os perfis informados (ex.: rotas de /api/empresas são só da Empresa). */
export function ensureNivelAcesso(...niveis: NivelAcesso[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!niveis.includes(usuarioDaRequisicao(req).nivel_acesso)) throw new ForbiddenError();
    next();
  };
}

/** Libera quem tiver ao menos uma das flags da tabela permissoes (seção 7 do PDF). */
export function ensurePermissao(...permissoes: Permissao[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const usuario = usuarioDaRequisicao(req);
    if (!permissoes.some((permissao) => usuario.permissoes[permissao])) throw new ForbiddenError();
    next();
  };
}
