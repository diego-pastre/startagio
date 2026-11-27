import { beforeEach, describe, expect, it } from "vitest";
import { FakePerfisEstudanteRepository } from "@modules/estudantes/repositories/fakes/FakePerfisEstudanteRepository";
import { FakeVagasRepository } from "@modules/vagas/repositories/fakes/FakeVagasRepository";
import { CreateVagaService } from "@modules/vagas/services/vaga/CreateVagaService";
import { FindFormularioVagaService } from "@modules/vagas/services/vaga/FindFormularioVagaService";
import { UpdateVagaService } from "@modules/vagas/services/vaga/UpdateVagaService";
import { UpdateStatusVagaService } from "@modules/vagas/services/vaga/UpdateStatusVagaService";
import { estudante, novaVaga, usuarioEmpresa } from "@modules/vagas/__tests__/fabricas";
import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import { FakeCandidaturasRepository } from "../repositories/fakes/FakeCandidaturasRepository";
import { ResponderProvaService } from "../services/candidatura/ResponderProvaService";
import { ListCandidatosService } from "../services/ranking/ListCandidatosService";
import { UpdateStatusCandidaturaService } from "../services/ranking/UpdateStatusCandidaturaService";

const empresa = usuarioEmpresa(1);
const outraEmpresa = usuarioEmpresa(2);
const alternativas = { A: "a", B: "b", C: "c", D: "d" };
const PAGINA = { pagina: 1, por_pagina: 20 };

let vagas: FakeVagasRepository;
let candidaturas: FakeCandidaturasRepository;
let perfis: FakePerfisEstudanteRepository;
let vagaId: number;

/** Estudante com perfil que faz a prova marcando as letras dadas (gabarito: B, A). */
async function candidatar(id: number, respostas: { "1": "A" | "B"; "2": "A" | "B" }) {
  const aluno = { ...estudante, id };
  await perfis.save(id, {
    curso: "Sistemas de Informação",
    grau: "GRADUACAO",
    semestre_atual: 5,
    instituicao_ensino: null,
    idioma: null,
    nivel_idioma: null,
  });
  return new ResponderProvaService(vagas, candidaturas, perfis).execute(aluno, vagaId, { respostas });
}

beforeEach(async () => {
  vagas = new FakeVagasRepository();
  candidaturas = new FakeCandidaturasRepository(vagas);
  perfis = new FakePerfisEstudanteRepository();
  vagaId = (await new CreateVagaService(vagas).execute(empresa, novaVaga())).id;
  candidaturas.registrarQuestionario(vagaId, {
    id: 1,
    titulo: "Prova",
    instrucoes: null,
    nota_minima_aprovacao: 6,
    questoes: [
      { id: 1, peso_nota: 1, enunciado: { pergunta: "Q1", alternativas, correta: "B" } },
      { id: 2, peso_nota: 1, enunciado: { pergunta: "Q2", alternativas, correta: "A" } },
    ],
  });
});

describe("ListCandidatosService", () => {
  it("ordena pela nota e mantém a posição do ranking completo ao filtrar", async () => {
    const meio = await candidatar(11, { "1": "B", "2": "B" }); // 5,00
    const primeiro = await candidatar(12, { "1": "B", "2": "A" }); // 10,00
    await candidatar(13, { "1": "A", "2": "B" }); // 0,00
    const listar = new ListCandidatosService(vagas, candidaturas);

    const ranking = await listar.execute(empresa, vagaId, PAGINA);
    expect(ranking.candidatos.dados.map((item) => item.id)).toEqual([primeiro.id, meio.id, 3]);
    expect(ranking.contagem).toMatchObject({ TODOS: 3, EM_ANALISE: 3, APROVADO: 0 });
    expect(ranking.nota_minima_aprovacao).toBe(6);

    await new UpdateStatusCandidaturaService(vagas, candidaturas).execute(empresa, meio.id, "APROVADO");
    const aprovados = await listar.execute(empresa, vagaId, { ...PAGINA, status: "APROVADO" });
    expect(aprovados.candidatos.dados).toHaveLength(1);
    expect(aprovados.candidatos.dados[0].posicao).toBe(2);
    expect(aprovados.contagem).toMatchObject({ APROVADO: 1, EM_ANALISE: 2 });
  });

  it("outra empresa não vê o ranking nem muda o status", async () => {
    const candidatura = await candidatar(11, { "1": "B", "2": "A" });

    await expect(new ListCandidatosService(vagas, candidaturas).execute(outraEmpresa, vagaId, PAGINA)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(
      new UpdateStatusCandidaturaService(vagas, candidaturas).execute(outraEmpresa, candidatura.id, "REPROVADO"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UpdateVagaService", () => {
  const formulario = () => new FindFormularioVagaService(vagas).execute(empresa, vagaId);

  it("edita tudo, inclusive a prova, enquanto ninguém respondeu", async () => {
    const { dados, prova_travada } = await formulario();
    expect(prova_travada).toBe(false);

    const editada = await new UpdateVagaService(vagas).execute(empresa, vagaId, {
      ...dados,
      vaga: { ...dados.vaga, titulo: "Estágio em Front-end" },
      questionario: { ...dados.questionario!, titulo: "Prova nova" },
    });

    expect(editada.titulo).toBe("Estágio em Front-end");
    expect(editada.questionario?.titulo).toBe("Prova nova");
  });

  it("depois da primeira candidatura a prova trava, mas o resto continua editável", async () => {
    await candidatar(11, { "1": "B", "2": "A" });
    const { dados, prova_travada } = await formulario();
    expect(prova_travada).toBe(true);

    const editar = new UpdateVagaService(vagas);
    await expect(editar.execute(empresa, vagaId, dados)).rejects.toBeInstanceOf(ConflictError);

    const { questionario: _prova, ...semProva } = dados;
    const editada = await editar.execute(empresa, vagaId, { ...semProva, vaga: { ...dados.vaga, valor_bolsa: 2000 } });
    expect(editada.valor_bolsa).toBe(2000);
    expect(editada.questionario?.titulo).toBe("Prova técnica");
  });

  it("vaga antiga sem prova ganha a prova pela edição e pode ser publicada de novo", async () => {
    const { dados } = await formulario();
    vagas.removerQuestionario(vagaId);
    const atualizar = new UpdateStatusVagaService(vagas);
    await atualizar.execute(empresa, vagaId, "PAUSADA");
    await expect(atualizar.execute(empresa, vagaId, "ABERTA")).rejects.toBeInstanceOf(ConflictError);

    await new UpdateVagaService(vagas).execute(empresa, vagaId, dados);

    expect((await atualizar.execute(empresa, vagaId, "ABERTA")).status).toBe("ABERTA");
  });

  it("não edita vaga encerrada nem vaga de outra empresa; o gabarito não sai para terceiros", async () => {
    const { dados } = await formulario();
    await expect(new FindFormularioVagaService(vagas).execute(outraEmpresa, vagaId)).rejects.toBeInstanceOf(NotFoundError);
    await expect(new UpdateVagaService(vagas).execute(outraEmpresa, vagaId, dados)).rejects.toBeInstanceOf(NotFoundError);

    await new UpdateStatusVagaService(vagas).execute(empresa, vagaId, "ENCERRADA");
    await expect(new UpdateVagaService(vagas).execute(empresa, vagaId, dados)).rejects.toBeInstanceOf(ConflictError);
  });
});
