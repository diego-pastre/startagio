import { describe, expect, it } from "vitest";
import type { PerfilDesejado } from "@startagio/contracts";
import type { QuestionarioComGabarito } from "../dto/CandidaturaDTO";
import { calcularAfinidade, criteriosDeAderencia } from "../utils/afinidade";
import { corrigirProva, questoesSemResposta } from "../utils/correcao";

const alternativas = { A: "a", B: "b", C: "c", D: "d" };
const questoes: QuestionarioComGabarito["questoes"] = [
  { id: 10, peso_nota: 2, enunciado: { pergunta: "Q1", alternativas, correta: "B" } },
  { id: 11, peso_nota: 1, enunciado: { pergunta: "Q2", alternativas, correta: "A" } },
  { id: 12, peso_nota: 1, enunciado: { pergunta: "Q3", alternativas, correta: "D" } },
];

describe("corrigirProva", () => {
  it("aplica a média ponderada da seção 6.3: (pesos certos ÷ pesos totais) × 10", () => {
    // Acertou a de peso 2 e uma de peso 1: 3 de 4 → 7,5.
    const resultado = corrigirProva(questoes, { "10": "B", "11": "A", "12": "C" });

    expect(resultado.nota_obtida).toBe(7.5);
    expect(resultado.acertos).toBe(2);
    expect(resultado.respostas[2]).toEqual({ questao_id: 12, marcada: "C", correta: "D", acertou: false });
  });

  it("tudo certo dá 10 e tudo errado dá 0", () => {
    expect(corrigirProva(questoes, { "10": "B", "11": "A", "12": "D" }).nota_obtida).toBe(10);
    expect(corrigirProva(questoes, { "10": "A", "11": "B", "12": "A" }).nota_obtida).toBe(0);
  });

  it("arredonda a nota em duas casas", () => {
    const tres = questoes.map((questao) => ({ ...questao, peso_nota: 1 }));
    expect(corrigirProva(tres, { "10": "B", "11": "C", "12": "C" }).nota_obtida).toBe(3.33);
  });

  it("aponta as questões sem resposta, no formato de erro por campo", () => {
    expect(questoesSemResposta(questoes, { "10": "B" })).toEqual({
      "respostas.11": "Responda esta questão",
      "respostas.12": "Responda esta questão",
    });
  });
});

const perfil: PerfilDesejado = {
  nivel_formacao: "BACHARELADO",
  semestre_minimo: 3,
  semestre_maximo: 7,
  idioma_exigido: "Inglês",
  nivel_idioma: "INTERMEDIARIO",
  habilidades_tecnicas: null,
  competencias_comportamentais: null,
  requisitos_obrigatorios: null,
  requisitos_desejaveis: null,
};
const cursos = [{ nome_curso: "Sistemas de Informação", grau: "GRADUACAO" as const, obrigatorio: true }];
const estudanteIdeal = { curso: "sistemas de informacao ", semestre_atual: 5, idioma: "ingles", nivel_idioma: "AVANCADO" as const };

describe("calcularAfinidade", () => {
  it("perfil que atende tudo e nota 10 dá 100", () => {
    expect(calcularAfinidade({ estudante: estudanteIdeal, perfilDesejado: perfil, cursos, nota: 10 })).toBe(100);
  });

  it("compara curso e idioma sem ligar para acento, maiúscula ou espaço", () => {
    expect(criteriosDeAderencia({ estudante: estudanteIdeal, perfilDesejado: perfil, cursos })).toEqual([100, 100, 100]);
  });

  it("curso fora da lista zera o critério do curso", () => {
    const estudante = { ...estudanteIdeal, curso: "Direito" };
    expect(criteriosDeAderencia({ estudante, perfilDesejado: perfil, cursos })[0]).toBe(0);
  });

  it("perde 25 pontos por semestre fora da faixa", () => {
    const estudante = { ...estudanteIdeal, semestre_atual: 1 };
    expect(criteriosDeAderencia({ estudante, perfilDesejado: perfil, cursos })[1]).toBe(50);
  });

  it("perde 35 pontos por nível de idioma abaixo e zera sem o idioma", () => {
    const basico = { ...estudanteIdeal, nivel_idioma: "BASICO" as const };
    const semIdioma = { ...estudanteIdeal, idioma: null, nivel_idioma: null };
    expect(criteriosDeAderencia({ estudante: basico, perfilDesejado: perfil, cursos })[2]).toBe(65);
    expect(criteriosDeAderencia({ estudante: semIdioma, perfilDesejado: perfil, cursos })[2]).toBe(0);
  });

  it("combina 60% de aderência com 40% da prova", () => {
    // Aderência: curso 0, semestre 100, idioma 100 → 66,67. Prova 5 → 50. 0,6 × 66,67 + 0,4 × 50 = 60.
    const estudante = { ...estudanteIdeal, curso: "Direito" };
    expect(calcularAfinidade({ estudante, perfilDesejado: perfil, cursos, nota: 5 })).toBe(60);
  });

  it("vaga sem requisitos: aderência total, só a prova diferencia", () => {
    const livre = { ...perfil, semestre_minimo: 1, semestre_maximo: null, idioma_exigido: null, nivel_idioma: null };
    expect(calcularAfinidade({ estudante: estudanteIdeal, perfilDesejado: livre, cursos: [], nota: 0 })).toBe(60);
  });
});
