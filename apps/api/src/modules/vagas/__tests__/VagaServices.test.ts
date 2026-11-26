import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError, ForbiddenError, NotFoundError } from "@shared/errors/AppError";
import { FakeVagasRepository } from "../repositories/fakes/FakeVagasRepository";
import { CreateVagaService } from "../services/vaga/CreateVagaService";
import { FindVagaService } from "../services/vaga/FindVagaService";
import { ListOpcoesFiltroVagasService } from "../services/vaga/ListOpcoesFiltroVagasService";
import { ListVagasAbertasService } from "../services/vaga/ListVagasAbertasService";
import { ListVagasDaEmpresaService } from "../services/vaga/ListVagasDaEmpresaService";
import { UpdateStatusVagaService } from "../services/vaga/UpdateStatusVagaService";
import { estudante, instituicao, novaVaga, usuarioEmpresa } from "./fabricas";

const empresa1 = usuarioEmpresa(1);
const empresa2 = usuarioEmpresa(2);
const PAGINA = { pagina: 1, por_pagina: 12 };

let repositorio: FakeVagasRepository;
let criar: CreateVagaService;

beforeEach(() => {
  repositorio = new FakeVagasRepository();
  criar = new CreateVagaService(repositorio);
});

describe("CreateVagaService", () => {
  it("cria a vaga na empresa do usuário logado, com perfil e cursos", async () => {
    const vaga = await criar.execute(empresa1, novaVaga());

    expect(vaga.empresa.id).toBe(1);
    expect(vaga.status).toBe("ABERTA");
    expect(vaga.perfil_desejado?.nivel_formacao).toBe("BACHARELADO");
    expect(vaga.cursos).toEqual([{ nome_curso: "Sistemas de Informação", grau: "GRADUACAO", obrigatorio: true }]);
  });

  it("exige a ficha jurídica da empresa antes", async () => {
    await expect(criar.execute(usuarioEmpresa(null), novaVaga())).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("FindVagaService", () => {
  it("estudante vê vaga aberta, mas não rascunho", async () => {
    const aberta = await criar.execute(empresa1, novaVaga());
    const rascunho = await criar.execute(empresa1, novaVaga((d) => (d.vaga.status = "RASCUNHO")));
    const buscar = new FindVagaService(repositorio);

    expect((await buscar.execute(estudante, aberta.id)).id).toBe(aberta.id);
    await expect(buscar.execute(estudante, rascunho.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rascunho aparece para a empresa dona e para a instituição, mas não para outra empresa", async () => {
    const rascunho = await criar.execute(empresa1, novaVaga((d) => (d.vaga.status = "RASCUNHO")));
    const buscar = new FindVagaService(repositorio);

    expect((await buscar.execute(empresa1, rascunho.id)).id).toBe(rascunho.id);
    expect((await buscar.execute(instituicao, rascunho.id)).id).toBe(rascunho.id);
    await expect(buscar.execute(empresa2, rascunho.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UpdateStatusVagaService", () => {
  it("publica o rascunho, pausa e reabre", async () => {
    const vaga = await criar.execute(empresa1, novaVaga((d) => (d.vaga.status = "RASCUNHO")));
    const atualizar = new UpdateStatusVagaService(repositorio);

    expect((await atualizar.execute(empresa1, vaga.id, "ABERTA")).status).toBe("ABERTA");
    expect((await atualizar.execute(empresa1, vaga.id, "PAUSADA")).status).toBe("PAUSADA");
    expect((await atualizar.execute(empresa1, vaga.id, "ABERTA")).status).toBe("ABERTA");
  });

  it("encerrada é definitiva", async () => {
    const vaga = await criar.execute(empresa1, novaVaga());
    const atualizar = new UpdateStatusVagaService(repositorio);
    await atualizar.execute(empresa1, vaga.id, "ENCERRADA");

    await expect(atualizar.execute(empresa1, vaga.id, "ABERTA")).rejects.toThrow(
      new ConflictError("Uma vaga encerrada não pode passar para aberta."),
    );
  });

  it("outra empresa não mexe na vaga (responde como se ela não existisse)", async () => {
    const vaga = await criar.execute(empresa1, novaVaga());
    await expect(new UpdateStatusVagaService(repositorio).execute(empresa2, vaga.id, "PAUSADA")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("não reabre vaga com a data limite vencida", async () => {
    const vaga = await criar.execute(empresa1, novaVaga((d) => (d.vaga.status = "RASCUNHO")));
    repositorio.alterarDataLimite(vaga.id, "2020-01-01");

    await expect(new UpdateStatusVagaService(repositorio).execute(empresa1, vaga.id, "ABERTA")).rejects.toThrow(
      "A data limite de inscrição já passou.",
    );
  });
});

describe("mural de vagas (ListVagasAbertasService)", () => {
  it("lista só vagas abertas e no prazo, das mais novas para as mais antigas", async () => {
    const antiga = await criar.execute(empresa1, novaVaga((d) => (d.vaga.titulo = "Antiga")));
    await criar.execute(empresa1, novaVaga((d) => (d.vaga.status = "RASCUNHO")));
    const vencida = await criar.execute(empresa1, novaVaga((d) => (d.vaga.titulo = "Vencida")));
    repositorio.alterarDataLimite(vencida.id, "2020-01-01");
    const nova = await criar.execute(empresa2, novaVaga((d) => (d.vaga.titulo = "Nova")));

    const { dados, total } = await new ListVagasAbertasService(repositorio).execute(PAGINA);

    expect(total).toBe(2);
    expect(dados.map((vaga) => vaga.id)).toEqual([nova.id, antiga.id]);
  });

  it("filtra por área, modalidade, curso e busca, e pagina o resultado", async () => {
    await criar.execute(empresa1, novaVaga());
    await criar.execute(
      empresa2,
      novaVaga((d) => {
        d.vaga.titulo = "Estágio em Contabilidade";
        d.vaga.area_atuacao = "Contabilidade";
        d.vaga.tipo_modelo = "PRESENCIAL";
        d.qualificacoes_cursos = [{ nome_curso: "Ciências Contábeis", grau: "GRADUACAO" }];
      }),
    );
    const listar = new ListVagasAbertasService(repositorio);
    const titulos = async (filtros: object) =>
      (await listar.execute({ ...PAGINA, ...filtros })).dados.map((vaga) => vaga.titulo);

    expect(await titulos({ area: "Contabilidade" })).toEqual(["Estágio em Contabilidade"]);
    expect(await titulos({ modalidade: "HIBRIDO" })).toEqual(["Estágio em Desenvolvimento Web"]);
    expect(await titulos({ curso: "Ciências Contábeis" })).toEqual(["Estágio em Contabilidade"]);
    expect(await titulos({ busca: "empresa 1" })).toEqual(["Estágio em Desenvolvimento Web"]);

    const primeiraPagina = await listar.execute({ pagina: 1, por_pagina: 1 });
    expect(primeiraPagina).toMatchObject({ total: 2, total_paginas: 2 });
    expect(primeiraPagina.dados).toHaveLength(1);
  });

  it("monta as opções de filtro só com o que existe nas vagas abertas", async () => {
    await criar.execute(empresa1, novaVaga());
    await criar.execute(
      empresa1,
      novaVaga((d) => {
        d.vaga.status = "RASCUNHO";
        d.vaga.area_atuacao = "Jurídico";
      }),
    );

    expect(await new ListOpcoesFiltroVagasService(repositorio).execute()).toEqual({
      areas: ["Tecnologia da Informação"],
      cursos: ["Sistemas de Informação"],
    });
  });
});

describe("ListVagasDaEmpresaService", () => {
  it("lista todas as vagas da empresa, em qualquer status, e filtra por status", async () => {
    await criar.execute(empresa1, novaVaga());
    await criar.execute(empresa1, novaVaga((d) => (d.vaga.status = "RASCUNHO")));
    await criar.execute(empresa2, novaVaga());
    const listar = new ListVagasDaEmpresaService(repositorio);

    expect((await listar.execute(empresa1, PAGINA)).total).toBe(2);
    expect((await listar.execute(empresa1, { ...PAGINA, status: "RASCUNHO" })).total).toBe(1);
    await expect(listar.execute(usuarioEmpresa(null), PAGINA)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
