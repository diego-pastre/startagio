import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "@shared/infra/http/middlewares/errorHandler";
import { criarLimiteDeLogin } from "@shared/infra/http/middlewares/limitarTentativasDeLogin";
import { LimiteDeTentativas } from "@shared/utils/LimiteDeTentativas";

const MINUTO = 60_000;

/** Relógio de mentira: o teste avança o tempo sem esperar. */
function relogio() {
  let instante = 0;
  return { agora: () => instante, avancar: (ms: number) => (instante += ms) };
}

describe("LimiteDeTentativas", () => {
  it("bloqueia depois do máximo de falhas e libera quando a janela acaba", () => {
    const tempo = relogio();
    const limite = new LimiteDeTentativas({ maximo: 3, janelaMs: 15 * MINUTO, agora: tempo.agora });

    limite.registrarFalha("ana");
    limite.registrarFalha("ana");
    expect(limite.esperaRestante("ana")).toBe(0);

    limite.registrarFalha("ana");
    expect(limite.esperaRestante("ana")).toBe(15 * MINUTO);
    expect(limite.esperaRestante("bruno")).toBe(0);

    tempo.avancar(10 * MINUTO);
    expect(limite.esperaRestante("ana")).toBe(5 * MINUTO);

    tempo.avancar(5 * MINUTO);
    expect(limite.esperaRestante("ana")).toBe(0);
  });

  it("limpar zera a contagem da chave", () => {
    const limite = new LimiteDeTentativas({ maximo: 1, janelaMs: MINUTO });
    limite.registrarFalha("ana");
    limite.limpar("ana");
    expect(limite.esperaRestante("ana")).toBe(0);
  });
});

describe("limite de tentativas no login", () => {
  /** App mínimo: a "senha certa" responde 200 e qualquer outra 401, como o login de verdade. */
  function appDeTeste(maximoPorLogin = 3, maximoPorEndereco = 100) {
    const app = express();
    app.use(express.json());
    app.post(
      "/login",
      criarLimiteDeLogin({
        porLogin: new LimiteDeTentativas({ maximo: maximoPorLogin, janelaMs: 15 * MINUTO }),
        porEndereco: new LimiteDeTentativas({ maximo: maximoPorEndereco, janelaMs: 15 * MINUTO }),
      }),
      (req, res) => {
        res.status(req.body.senha === "certa" ? 200 : 401).json({});
      },
    );
    app.use(errorHandler);
    return app;
  }

  const tentar = (app: express.Express, login: string, senha: string, endereco = "200.1.1.1") =>
    request(app).post("/login").set("X-Real-IP", endereco).send({ login, senha });

  it("depois de 3 senhas erradas, bloqueia a conta até com a senha certa, e avisa quanto esperar", async () => {
    const app = appDeTeste();
    for (let i = 0; i < 3; i++) expect((await tentar(app, "ana", "errada")).status).toBe(401);

    const bloqueado = await tentar(app, "ana", "certa");
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.mensagem).toBe("Muitas tentativas de login. Tente de novo em 15 minutos.");
    expect(bloqueado.headers["retry-after"]).toBe("900");
  });

  it("conta o login sem diferenciar maiúsculas e espaços, e não afeta outras contas", async () => {
    const app = appDeTeste();
    await tentar(app, "Ana", "errada");
    await tentar(app, " ana ", "errada");
    await tentar(app, "ANA", "errada");

    expect((await tentar(app, "ana", "certa")).status).toBe(429);
    expect((await tentar(app, "bruno", "certa")).status).toBe(200);
  });

  it("login certo zera a contagem da conta", async () => {
    const app = appDeTeste();
    await tentar(app, "ana", "errada");
    await tentar(app, "ana", "errada");
    expect((await tentar(app, "ana", "certa")).status).toBe(200);

    await tentar(app, "ana", "errada");
    await tentar(app, "ana", "errada");
    expect((await tentar(app, "ana", "certa")).status).toBe(200);
  });

  it("bloqueia o endereço que erra em muitas contas diferentes", async () => {
    const app = appDeTeste(10, 2);
    await tentar(app, "ana", "errada", "200.9.9.9");
    await tentar(app, "bruno", "errada", "200.9.9.9");

    expect((await tentar(app, "carla", "certa", "200.9.9.9")).status).toBe(429);
    expect((await tentar(app, "carla", "certa", "200.8.8.8")).status).toBe(200);
  });
});
