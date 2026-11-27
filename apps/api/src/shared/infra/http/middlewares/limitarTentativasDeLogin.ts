import type { NextFunction, Request, RequestHandler, Response } from "express";
import { TooManyRequestsError } from "@shared/errors/AppError";
import { LimiteDeTentativas } from "@shared/utils/LimiteDeTentativas";

const QUINZE_MINUTOS = 15 * 60 * 1000;

interface Limites {
  /** Protege cada conta de alguém tentando adivinhar a senha. */
  porLogin: LimiteDeTentativas;
  /** Folgado de propósito: uma faculdade inteira pode sair para a internet pelo mesmo endereço. */
  porEndereco: LimiteDeTentativas;
}

/**
 * Endereço de quem acessa. O navegador fala com o Next, e o Next repassa para a API os cabeçalhos
 * do pedido original. Na hospedagem (Railway), a entrada pública grava o endereço real no X-Real-IP
 * e apaga o que o visitante tenha mandado nele. Sem o cabeçalho (em desenvolvimento), vale a conexão.
 * Por isso a API não pode ter endereço público: só o Next deve conseguir falar com ela.
 */
function enderecoDoVisitante(req: Request): string {
  return req.get("x-real-ip")?.trim() || req.socket.remoteAddress || "desconhecido";
}

/** O login (usuário ou e-mail) como o loginSchema deixa: sem espaços nas pontas e em minúsculas. */
function loginDigitado(req: Request): string | null {
  const login: unknown = req.body?.login;
  return typeof login === "string" && login.trim() ? login.trim().toLowerCase() : null;
}

function mensagemDeEspera(esperaMs: number): string {
  const minutos = Math.max(1, Math.ceil(esperaMs / 60_000));
  return `Muitas tentativas de login. Tente de novo em ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`;
}

/**
 * Bloqueia o login por alguns minutos depois de muitas senhas erradas.
 * Só a resposta 401 (usuário ou senha inválidos) conta como falha; login certo zera a conta daquele login.
 */
export function criarLimiteDeLogin({ porLogin, porEndereco }: Limites): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const login = loginDigitado(req);
    const endereco = enderecoDoVisitante(req);

    const espera = Math.max(login ? porLogin.esperaRestante(login) : 0, porEndereco.esperaRestante(endereco));
    if (espera > 0) {
      res.set("Retry-After", String(Math.ceil(espera / 1000)));
      throw new TooManyRequestsError(mensagemDeEspera(espera));
    }

    res.on("finish", () => {
      if (res.statusCode === 401) {
        if (login) porLogin.registrarFalha(login);
        porEndereco.registrarFalha(endereco);
      } else if (res.statusCode < 400 && login) {
        porLogin.limpar(login);
      }
    });
    next();
  };
}

/** 10 senhas erradas por conta, ou 50 por endereço, a cada 15 minutos. */
export const limitarTentativasDeLogin = criarLimiteDeLogin({
  porLogin: new LimiteDeTentativas({ maximo: 10, janelaMs: QUINZE_MINUTOS }),
  porEndereco: new LimiteDeTentativas({ maximo: 50, janelaMs: QUINZE_MINUTOS }),
});
