import { beforeEach, describe, expect, it } from "vitest";
import { FakePerfisEstudanteRepository } from "@modules/estudantes/repositories/fakes/FakePerfisEstudanteRepository";
import { FakeVagasRepository } from "@modules/vagas/repositories/fakes/FakeVagasRepository";
import { CreateVagaService } from "@modules/vagas/services/vaga/CreateVagaService";
import { FindVagaService } from "@modules/vagas/services/vaga/FindVagaService";
import { estudante, novaVaga, usuarioEmpresa } from "@modules/vagas/__tests__/fabricas";
import { AppError, ConflictError, NotFoundError } from "@shared/errors/AppError";
import { FakeCandidaturasRepository } from "../repositories/fakes/FakeCandidaturasRepository";
import { ListCandidaturasService } from "../services/candidatura/ListCandidaturasService";
import { PERFIL_PENDENTE, ResponderProvaService } from "../services/candidatura/ResponderProvaService";
import { FindProvaService } from "../services/prova/FindProvaService";

const empresa = usuarioEmpresa(1);
const alternativas = { A: "a", B: "b", C: "c", D: "d" };
const TODAS_CERTAS = { "1": "B", "2": "A", "3": "D" } as const;

let vagas: FakeVagasRepository;
let candidaturas: FakeCandidaturasRepository;
let perfis: FakePerfisEstudanteRepository;
let responder: ResponderProvaService;
let vagaId: number;

beforeEach(async () => {
  vagas = new FakeVagasRepository();
  candidaturas = new FakeCandidaturasRepository(vagas);
  perfis = new FakePerfisEstudanteRepository();
  responder = new ResponderProvaService(vagas, candidaturas, perfis);

  vagaId = (await new CreateVagaService(vagas).execute(empresa, novaVaga())).id;
  candidaturas.registrarQuestionario(vagaId, {
    id: 1,
    titulo: "Prova técnica",
    instrucoes: null,
    nota_minima_aprovacao: 6,
    questoes: [
      { id: 1, peso_nota: 2, enunciado: { pergunta: "Q1", alternativas, correta: "B" } },
      { id: 2, peso_nota: 1, enunciado: { pergunta: "Q2", alternativas, correta: "A" } },
      { id: 3, peso_nota: 1, enunciado: { pergunta: "Q3", alternativas, correta: "D" } },
    ],
  });
  await perfis.save(estudante.id, {
    curso: "Sistemas de Informação",
    grau: "GRADUACAO",
    semestre_atual: 5,
    instituicao_ensino: null,
    idioma: null,
    nivel_idioma: null,
  });
});

describe("FindProvaService", () => {
  it("entrega a prova sem a alternativa correta (seção 6.3 do PDF)", async () => {
    const prova = await new FindProvaService(vagas, candidaturas).execute(estudante, vagaId);

    expect(prova.questoes).toHaveLength(3);
    expect(prova.questoes[0]).toEqual({ id: 1, peso_nota: 2, pergunta: "Q1", alternativas });
    expect(JSON.stringify(prova)).not.toContain("correta");
  });

  it("vaga sem prova responde 409", async () => {
    const semProva = (await new CreateVagaService(vagas).execute(empresa, novaVaga())).id;
    await expect(new FindProvaService(vagas, candidaturas).execute(estudante, semProva)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it("vaga fora do prazo não abre a prova", async () => {
    vagas.alterarDataLimite(vagaId, "2000-01-01");
    await expect(new FindProvaService(vagas, candidaturas).execute(estudante, vagaId)).rejects.toThrow(
      "As inscrições desta vaga terminaram.",
    );
  });
});

describe("ResponderProvaService", () => {
  it("grava a candidatura com nota, afinidade e status Em análise", async () => {
    const candidatura = await responder.execute(estudante, vagaId, { respostas: { "1": "B", "2": "C", "3": "D" } });

    expect(candidatura).toMatchObject({
      nota_obtida: 7.5,
      acertos: 2,
      total_questoes: 3,
      status_aprovacao: "EM_ANALISE",
      nota_minima_aprovacao: 6,
    });
    // Curso aceito (100) → aderência 100; prova 7,5 → 75. 0,6 × 100 + 0,4 × 75 = 90.
    expect(candidatura.pontuacao_afinidade).toBe(90);
  });

  it("não deixa responder duas vezes (uq_estudante_vaga)", async () => {
    await responder.execute(estudante, vagaId, { respostas: TODAS_CERTAS });
    await expect(responder.execute(estudante, vagaId, { respostas: TODAS_CERTAS })).rejects.toBeInstanceOf(ConflictError);
    await expect(new FindProvaService(vagas, candidaturas).execute(estudante, vagaId)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it("exige o perfil acadêmico antes", async () => {
    const semPerfil = { ...estudante, id: 99 };
    await expect(responder.execute(semPerfil, vagaId, { respostas: TODAS_CERTAS })).rejects.toThrow(PERFIL_PENDENTE);
  });

  it("questão sem resposta volta 422 com o campo", async () => {
    const erro = await responder.execute(estudante, vagaId, { respostas: { "1": "B" } }).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(AppError);
    expect((erro as AppError).statusCode).toBe(422);
    expect((erro as AppError).campos).toHaveProperty("respostas.2");
  });

  it("vaga inexistente responde 404", async () => {
    await expect(responder.execute(estudante, 999, { respostas: TODAS_CERTAS })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("depois de responder", () => {
  it("o detalhe da vaga mostra a candidatura do estudante (ja_candidatou da Tela 3)", async () => {
    const buscar = new FindVagaService(vagas, candidaturas);
    expect((await buscar.execute(estudante, vagaId)).minha_candidatura).toBeNull();

    await responder.execute(estudante, vagaId, { respostas: TODAS_CERTAS });

    expect((await buscar.execute(estudante, vagaId)).minha_candidatura).toMatchObject({
      nota_obtida: 10,
      status_aprovacao: "EM_ANALISE",
    });
    expect((await buscar.execute(empresa, vagaId)).minha_candidatura).toBeNull();
  });

  it("aparece em Minhas candidaturas, com filtro por status", async () => {
    await responder.execute(estudante, vagaId, { respostas: TODAS_CERTAS });
    const listar = new ListCandidaturasService(candidaturas);

    expect((await listar.execute(estudante, { pagina: 1, por_pagina: 10 })).total).toBe(1);
    expect((await listar.execute(estudante, { status: "APROVADO", pagina: 1, por_pagina: 10 })).total).toBe(0);
  });
});
