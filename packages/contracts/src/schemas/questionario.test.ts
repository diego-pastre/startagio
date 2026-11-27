import { describe, expect, it } from "vitest";
import { perfilEstudanteSchema } from "./estudante";
import { questionarioSchema, responderProvaSchema } from "./questionario";

const questao = {
  peso_nota: "2",
  enunciado: {
    pergunta: "Qual cláusula apaga os registros filhos automaticamente?",
    alternativas: { A: "ON DELETE RESTRICT", B: "ON DELETE CASCADE", C: "ON UPDATE SET NULL", D: "AUTO_REMOVE" },
    correta: "B",
  },
};

function camposComErro(dados: unknown): string[] {
  const resultado = questionarioSchema.safeParse(dados);
  return resultado.success ? [] : resultado.error.issues.map((issue) => issue.path.join("."));
}

describe("questionarioSchema", () => {
  it("usa 6,00 de nota mínima e peso 1 quando ficam vazios (padrões do PDF)", () => {
    const dados = questionarioSchema.parse({
      titulo: "Prova",
      nota_minima_aprovacao: "",
      questoes: [{ ...questao, peso_nota: "" }],
    });

    expect(dados.nota_minima_aprovacao).toBe(6);
    expect(dados.questoes[0].peso_nota).toBe(1);
    expect(dados.instrucoes).toBeNull();
  });

  it("converte vírgula decimal e aceita a própria saída de novo", () => {
    const dados = questionarioSchema.parse({ titulo: "Prova", nota_minima_aprovacao: "7,5", questoes: [questao] });

    expect(dados.nota_minima_aprovacao).toBe(7.5);
    expect(questionarioSchema.parse(dados)).toEqual(dados);
  });

  it("exige ao menos uma questão, as quatro alternativas e a correta", () => {
    expect(camposComErro({ titulo: "Prova", questoes: [] })).toContain("questoes");
    expect(
      camposComErro({
        titulo: "Prova",
        questoes: [{ enunciado: { pergunta: "?", alternativas: { A: "a", B: "b", C: "", D: "d" } } }],
      }),
    ).toEqual(expect.arrayContaining(["questoes.0.enunciado.alternativas.C", "questoes.0.enunciado.correta"]));
  });

  it("nota mínima fica entre 0 e 10", () => {
    expect(camposComErro({ titulo: "Prova", nota_minima_aprovacao: 11, questoes: [questao] })).toEqual([
      "nota_minima_aprovacao",
    ]);
  });
});

describe("responderProvaSchema", () => {
  it("aceita a letra de cada questão pelo id", () => {
    expect(responderProvaSchema.parse({ respostas: { "12": "B", "13": "D" } }).respostas).toEqual({ "12": "B", "13": "D" });
  });

  it("recusa letra fora de A a D e id que não é número", () => {
    expect(responderProvaSchema.safeParse({ respostas: { "12": "E" } }).success).toBe(false);
    expect(responderProvaSchema.safeParse({ respostas: { abc: "A" } }).success).toBe(false);
  });
});

describe("perfilEstudanteSchema", () => {
  it("converte o semestre e limpa o nível quando não há idioma", () => {
    const perfil = perfilEstudanteSchema.parse({
      curso: "Sistemas de Informação",
      grau: "GRADUACAO",
      semestre_atual: "5",
      idioma: "",
      nivel_idioma: "AVANCADO",
    });

    expect(perfil).toMatchObject({ semestre_atual: 5, idioma: null, nivel_idioma: null, instituicao_ensino: null });
  });

  it("com idioma, o nível é obrigatório", () => {
    const resultado = perfilEstudanteSchema.safeParse({
      curso: "Direito",
      grau: "GRADUACAO",
      semestre_atual: 3,
      idioma: "Inglês",
    });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].path).toEqual(["nivel_idioma"]);
  });
});
