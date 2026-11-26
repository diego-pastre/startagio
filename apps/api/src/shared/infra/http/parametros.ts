import type { Request } from "express";
import { NotFoundError } from "@shared/errors/AppError";

/** Lê o :id da rota. Id que não é inteiro positivo responde 404, como um registro que não existe. */
export function idDaRota(req: Request, mensagem = "Registro não encontrado."): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new NotFoundError(mensagem);
  return id;
}
