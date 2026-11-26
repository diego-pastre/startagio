import { beforeEach, describe, expect, it } from "vitest";
import { cadastroUsuarioSchema } from "@startagio/contracts";
import { ConflictError } from "@shared/errors/AppError";
import { FakeHashProvider } from "@shared/providers/HashProvider/fakes/FakeHashProvider";
import { FakeTokenProvider } from "@shared/providers/TokenProvider/fakes/FakeTokenProvider";
import { FakeUsuariosRepository } from "../repositories/fakes/FakeUsuariosRepository";
import { RegisterUsuarioService } from "../services/usuario/RegisterUsuarioService";

const cadastro = cadastroUsuarioSchema.parse({
  nome_completo: "Ana Souza",
  usuario: "anasouza",
  email: "ana@exemplo.com",
  senha: "senha-segura",
  data_nascimento: "2004-05-10",
  cpf: "529.982.247-25",
  telefone: "31998765432",
  nivel_acesso: "ESTUDANTE",
});

describe("RegisterUsuarioService", () => {
  let repositorio: FakeUsuariosRepository;
  let service: RegisterUsuarioService;

  beforeEach(() => {
    repositorio = new FakeUsuariosRepository();
    service = new RegisterUsuarioService(repositorio, new FakeHashProvider(), new FakeTokenProvider());
  });

  it("cria o usuário com a senha em hash e abre a sessão", async () => {
    const { usuario, token } = await service.execute(cadastro);

    expect(token).toBe(`token-${usuario.id}`);
    expect(usuario).not.toHaveProperty("senha");
    expect(usuario.permissoes.pode_candidatar).toBe(true);
    expect((await repositorio.findById(usuario.id))?.senha).toBe("hash:senha-segura");
  });

  it("aponta cada campo repetido (usuário, e-mail e CPF)", async () => {
    await service.execute(cadastro);

    const erro = await service.execute(cadastro).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ConflictError);
    expect((erro as ConflictError).campos).toEqual({
      usuario: "Este usuário já está em uso.",
      email: "Este e-mail já possui cadastro.",
      cpf: "Este CPF já possui cadastro.",
    });
  });
});
