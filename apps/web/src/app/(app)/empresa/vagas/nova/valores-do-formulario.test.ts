import { describe, expect, it } from "vitest";
import { editarVagaSchema, novaVagaSchema, type EditarVagaData } from "@startagio/contracts";
import { valoresDaVagaSalva } from "./valores-do-formulario";

const salva: EditarVagaData = {
  vaga: {
    titulo: "Estágio em Dados",
    area_atuacao: "Dados",
    tipo_modelo: "REMOTO",
    carga_horaria_semanal: 30,
    valor_bolsa: 1350,
    auxilio_transporte: true,
    quantidade_posicoes: 2,
    local_atuacao: null,
    data_limite_inscricao: "2099-02-28",
    descricao: "Painéis e análises.",
    beneficios: null,
  },
  perfil_desejado: {
    nivel_formacao: "BACHARELADO",
    semestre_minimo: 3,
    semestre_maximo: null,
    idioma_exigido: null,
    nivel_idioma: null,
    habilidades_tecnicas: "SQL, Python",
    competencias_comportamentais: null,
    requisitos_obrigatorios: null,
    requisitos_desejaveis: null,
  },
  qualificacoes_cursos: [{ nome_curso: "Estatística", grau: "GRADUACAO", obrigatorio: true }],
  questionario: {
    titulo: "Prova",
    instrucoes: null,
    nota_minima_aprovacao: 7.5,
    questoes: [
      {
        peso_nota: 1.5,
        enunciado: { pergunta: "Q1", alternativas: { A: "a", B: "b", C: "c", D: "d" }, correta: "C" },
      },
    ],
  },
};

describe("valoresDaVagaSalva", () => {
  it("põe os valores no formato em que a pessoa digita", () => {
    const valores = valoresDaVagaSalva(salva);

    expect(valores.vaga).toMatchObject({ valor_bolsa: "1.350,00", carga_horaria_semanal: "30", local_atuacao: "" });
    expect(valores.perfil_desejado).toMatchObject({ semestre_minimo: "3", semestre_maximo: "", nivel_idioma: "" });
    expect(valores.questionario.nota_minima_aprovacao).toBe("7,50");
    expect(valores.questionario.questoes[0].peso_nota).toBe("1,5");
  });

  it("ida e volta: o schema lê os valores do formulário e devolve a vaga como estava", () => {
    const { vaga, ...resto } = novaVagaSchema.parse(valoresDaVagaSalva(salva));
    const { status: _status, ...dadosGerais } = vaga;

    expect(editarVagaSchema.parse({ ...resto, vaga: dadosGerais })).toEqual(salva);
  });

  it("vaga antiga sem prova começa com uma questão em branco", () => {
    const valores = valoresDaVagaSalva({ ...salva, questionario: undefined });

    expect(valores.questionario.questoes).toHaveLength(1);
    expect(valores.questionario.titulo).toBe("");
  });
});
