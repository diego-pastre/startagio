import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "@shared/infra/http/app";

// Confere rotas, middlewares e o formato dos erros. Nenhum destes casos chega a consultar o banco.
describe("API (sem banco)", () => {
  it("responde o health check", async () => {
    const resposta = await request(app).get("/api/health");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: "ok" });
  });

  it("devolve 422 com a mensagem de cada campo inválido no cadastro", async () => {
    const resposta = await request(app).post("/api/auth/register").send({ usuario: "a b", cpf: "123" });
    expect(resposta.status).toBe(422);
    expect(resposta.body.campos).toMatchObject({ usuario: expect.any(String), cpf: "CPF inválido" });
  });

  it("devolve 400 para JSON malformado", async () => {
    const resposta = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"login":');
    expect(resposta.status).toBe(400);
  });

  it("exige sessão em /auth/me, /empresas e /vagas", async () => {
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    expect((await request(app).get("/api/empresas/me")).status).toBe(401);
    expect((await request(app).get("/api/vagas")).status).toBe(401);
    expect((await request(app).post("/api/vagas").send({})).status).toBe(401);
  });

  it("recusa cookie de sessão inválido", async () => {
    const resposta = await request(app).get("/api/auth/me").set("Cookie", "startagio_token=forjado");
    expect(resposta.status).toBe(401);
  });

  it("devolve 404 em JSON para rota desconhecida", async () => {
    const resposta = await request(app).get("/api/nao-existe");
    expect(resposta.status).toBe(404);
    expect(resposta.body.mensagem).toBe("Rota não encontrada.");
  });
});
