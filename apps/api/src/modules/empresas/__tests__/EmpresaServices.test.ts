import { beforeEach, describe, expect, it } from "vitest";
import { empresaSchema } from "@startagio/contracts";
import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import { FakeEmpresasRepository } from "../repositories/fakes/FakeEmpresasRepository";
import { CreateEmpresaService } from "../services/empresa/CreateEmpresaService";
import { FindEmpresaByUsuarioService } from "../services/empresa/FindEmpresaByUsuarioService";
import { UpdateEmpresaService } from "../services/empresa/UpdateEmpresaService";

const dadosEmpresa = empresaSchema.parse({
  razao_social: "Tech Vale LTDA",
  nome_fantasia: "Tech Vale",
  cnpj: "11.222.333/0001-81",
  telefone_comercial: "3138221000",
  email_contato: "rh@techvale.com.br",
  nome_responsavel: "Carlos Lima",
  cep: "35160-000",
  logradouro: "Av. Pedro Linhares Gomes",
  numero: "3900",
  bairro: "Industrial",
  cidade: "Ipatinga",
  estado: "MG",
});

describe("serviços de empresa", () => {
  let repositorio: FakeEmpresasRepository;
  let criar: CreateEmpresaService;

  beforeEach(() => {
    repositorio = new FakeEmpresasRepository();
    criar = new CreateEmpresaService(repositorio);
  });

  it("cria a ficha da empresa ligada ao usuário logado", async () => {
    const empresa = await criar.execute(7, dadosEmpresa);

    expect(empresa.usuario_id).toBe(7);
    expect(await new FindEmpresaByUsuarioService(repositorio).execute(7)).toEqual(empresa);
  });

  it("não deixa o mesmo usuário cadastrar duas empresas nem repetir CNPJ", async () => {
    await criar.execute(7, dadosEmpresa);

    await expect(criar.execute(7, dadosEmpresa)).rejects.toBeInstanceOf(ConflictError);
    await expect(criar.execute(8, dadosEmpresa)).rejects.toThrow("Este CNPJ já possui cadastro ativo no sistema.");
  });

  it("na edição, recusa CNPJ de outra empresa e aceita manter o próprio", async () => {
    await criar.execute(7, dadosEmpresa);
    await criar.execute(8, { ...dadosEmpresa, cnpj: "12ABC34501DE35" });
    const atualizar = new UpdateEmpresaService(repositorio);

    await expect(atualizar.execute(8, dadosEmpresa)).rejects.toBeInstanceOf(ConflictError);
    expect((await atualizar.execute(7, { ...dadosEmpresa, nome_fantasia: "Tech Vale Estágios" })).nome_fantasia).toBe(
      "Tech Vale Estágios",
    );
  });

  it("devolve 404 quando o usuário ainda não tem empresa", async () => {
    await expect(new FindEmpresaByUsuarioService(repositorio).execute(99)).rejects.toBeInstanceOf(NotFoundError);
  });
});
