import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ApiErro } from "@startagio/contracts";
import { AppError } from "@shared/errors/AppError";
import { Prisma } from "@shared/infra/prisma/models";
import { camposComErro } from "@shared/utils/zod";

function responder(res: Response, status: number, corpo: ApiErro): void {
  res.status(status).json(corpo);
}

function isJsonInvalido(erro: unknown): boolean {
  return typeof erro === "object" && erro !== null && "type" in erro && erro.type === "entity.parse.failed";
}

// O Express só trata como middleware de erro a função com 4 parâmetros, por isso o _next.
export function errorHandler(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (erro instanceof AppError) {
    responder(res, erro.statusCode, { mensagem: erro.message, campos: erro.campos });
    return;
  }

  if (erro instanceof ZodError) {
    responder(res, 422, { mensagem: "Confira os campos destacados.", campos: camposComErro(erro) });
    return;
  }

  if (isJsonInvalido(erro)) {
    responder(res, 400, { mensagem: "O corpo da requisição não é um JSON válido." });
    return;
  }

  // Chave única violada (erro 1062 do MariaDB) que escapou da checagem feita no service.
  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
    responder(res, 409, { mensagem: "Já existe um registro com estes dados." });
    return;
  }

  console.error(erro);
  responder(res, 500, { mensagem: "Erro interno do servidor." });
}
