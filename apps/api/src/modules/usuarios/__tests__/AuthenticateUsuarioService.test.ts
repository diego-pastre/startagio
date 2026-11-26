import { beforeEach, describe, expect, it } from "vitest";
import { UnauthorizedError } from "@shared/errors/AppError";
import { FakeHashProvider } from "@shared/providers/HashProvider/fakes/FakeHashProvider";
import { FakeTokenProvider } from "@shared/providers/TokenProvider/fakes/FakeTokenProvider";
import { FakeUsuariosRepository } from "../repositories/fakes/FakeUsuariosRepository";
import { AuthenticateUsuarioService } from "../services/usuario/AuthenticateUsuarioService";

describe("AuthenticateUsuarioService", () => {
  let service: AuthenticateUsuarioService;

  beforeEach(async () => {
    const repositorio = new FakeUsuariosRepository();
    await repositorio.create({
      nome_completo: "Tech Vale",
      usuario: "techvale",
      email: "rh@techvale.com.br",
      senha: "hash:senha-segura",
      data_nascimento: new Date("1990-01-01T00:00:00.000Z"),
      cpf: "52998224725",
      telefone: "3138221000",
      endereco: null,
      nivel_acesso: "EMPRESA",
    });
    service = new AuthenticateUsuarioService(repositorio, new FakeHashProvider(), new FakeTokenProvider());
  });

  it("entra com o usuário ou com o e-mail", async () => {
    const porUsuario = await service.execute({ login: "techvale", senha: "senha-segura" });
    const porEmail = await service.execute({ login: "rh@techvale.com.br", senha: "senha-segura" });

    expect(porUsuario.usuario.id).toBe(porEmail.usuario.id);
    expect(porUsuario.usuario.permissoes.pode_criar_vagas).toBe(true);
  });

  it("dá a mesma resposta para senha errada e login inexistente", async () => {
    await expect(service.execute({ login: "techvale", senha: "errada" })).rejects.toThrow(
      new UnauthorizedError("Usuário ou senha inválidos."),
    );
    await expect(service.execute({ login: "ninguem", senha: "senha-segura" })).rejects.toThrow(
      new UnauthorizedError("Usuário ou senha inválidos."),
    );
  });
});
