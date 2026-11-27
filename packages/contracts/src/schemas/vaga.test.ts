import { describe, expect, it } from "vitest";
import { filtrosVagasSchema, novaVagaSchema, podeMudarStatus } from "./vaga";

// Exemplo da seção 7.1 do PDF, com valores como o formulário envia.
const doFormulario = {
  vaga: {
    titulo: "Estágio em Desenvolvimento de Sistemas Web",
    descricao: "Atuar no apoio ao desenvolvimento de interfaces web e manutenção de banco de dados MariaDB.",
    area_atuacao: "Tecnologia da Informação",
    tipo_modelo: "HIBRIDO",
    carga_horaria_semanal: "30",
    valor_bolsa: "1.350,00",
    auxilio_transporte: true,
    beneficios: "Auxílio alimentação e seguro de vida em grupo",
    local_atuacao: "Açailândia - MA",
    quantidade_posicoes: "2",
    status: "ABERTA",
    data_limite_inscricao: "2099-12-15",
  },
  perfil_desejado: {
    semestre_minimo: "3",
    semestre_maximo: "7",
    nivel_formacao: "BACHARELADO",
    idioma_exigido: "Inglês",
    nivel_idioma: "BASICO",
    habilidades_tecnicas: "HTML5, CSS3, JavaScript, PHP 8, SQL, sql",
    competencias_comportamentais: "Trabalho em equipe, boa comunicação, proatividade",
    requisitos_obrigatorios: "Conhecimento em lógica de programação e modelagem relacional",
    requisitos_desejaveis: "Noções de Git e APIs REST",
  },
  qualificacoes_cursos: [
    { nome_curso: "Sistemas de Informação", grau: "GRADUACAO", obrigatorio: true },
    { nome_curso: "Engenharia de Software", grau: "GRADUACAO", obrigatorio: false },
  ],
  questionario: {
    titulo: "Avaliação Técnica de Banco de Dados e Desenvolvimento Web",
    instrucoes: "Responda às questões abaixo com atenção. A nota mínima recomendada é 6.00.",
    nota_minima_aprovacao: "6,00",
    questoes: [
      {
        peso_nota: "2",
        enunciado: {
          pergunta: "Qual comando SQL recupera registros combinando duas tabelas apenas quando há correspondência em ambas?",
          alternativas: { A: "LEFT JOIN", B: "INNER JOIN", C: "OUTER UNION", D: "GROUP BY" },
          correta: "B",
        },
      },
    ],
  },
};

function comAlteracao(alterar: (dados: typeof doFormulario) => void) {
  const copia: typeof doFormulario = JSON.parse(JSON.stringify(doFormulario));
  alterar(copia);
  return copia;
}

function camposComErro(dados: unknown): string[] {
  const resultado = novaVagaSchema.safeParse(dados);
  return resultado.success ? [] : resultado.error.issues.map((issue) => issue.path.join("."));
}

describe("novaVagaSchema", () => {
  it("converte o que o formulário digita para o formato do banco", () => {
    const dados = novaVagaSchema.parse(doFormulario);

    expect(dados.vaga).toMatchObject({ carga_horaria_semanal: 30, valor_bolsa: 1350, quantidade_posicoes: 2 });
    expect(dados.perfil_desejado).toMatchObject({
      semestre_minimo: 3,
      semestre_maximo: 7,
      habilidades_tecnicas: "HTML5, CSS3, JavaScript, PHP 8, SQL",
    });
  });

  it("aceita a própria saída de novo (o front converte e a API valida outra vez)", () => {
    const umaVez = novaVagaSchema.parse(doFormulario);
    expect(novaVagaSchema.parse(umaVez)).toEqual(umaVez);
  });

  it("aceita 1 e 0 nos campos sim/não, como no payload do PDF", () => {
    const dados = novaVagaSchema.parse(
      comAlteracao((d) => {
        (d.vaga as Record<string, unknown>).auxilio_transporte = 0;
        (d.qualificacoes_cursos[0] as Record<string, unknown>).obrigatorio = 1;
      }),
    );
    expect(dados.vaga.auxilio_transporte).toBe(false);
    expect(dados.qualificacoes_cursos[0].obrigatorio).toBe(true);
  });

  it("aplica os limites do PDF: até 30 horas, bolsa não negativa e data limite futura", () => {
    expect(camposComErro(comAlteracao((d) => (d.vaga.carga_horaria_semanal = "31")))).toEqual(["vaga.carga_horaria_semanal"]);
    expect(camposComErro(comAlteracao((d) => (d.vaga.valor_bolsa = "-1")))).toEqual(["vaga.valor_bolsa"]);
    expect(camposComErro(comAlteracao((d) => (d.vaga.data_limite_inscricao = "2020-01-01")))).toEqual([
      "vaga.data_limite_inscricao",
    ]);
  });

  it("deixa a bolsa vazia como zero e a data limite vazia como null", () => {
    const dados = novaVagaSchema.parse(
      comAlteracao((d) => {
        d.vaga.valor_bolsa = "";
        d.vaga.data_limite_inscricao = "";
      }),
    );
    expect(dados.vaga.valor_bolsa).toBe(0);
    expect(dados.vaga.data_limite_inscricao).toBeNull();
  });

  it("exige o nível quando há idioma e descarta o nível quando não há idioma", () => {
    expect(camposComErro(comAlteracao((d) => (d.perfil_desejado.nivel_idioma = "")))).toEqual(["perfil_desejado.nivel_idioma"]);

    const semIdioma = novaVagaSchema.parse(comAlteracao((d) => (d.perfil_desejado.idioma_exigido = "")));
    expect(semIdioma.perfil_desejado.nivel_idioma).toBeNull();
  });

  it("não aceita semestre máximo menor que o mínimo", () => {
    expect(camposComErro(comAlteracao((d) => (d.perfil_desejado.semestre_maximo = "2")))).toEqual([
      "perfil_desejado.semestre_maximo",
    ]);
  });

  it("exige pelo menos um curso e recusa curso repetido", () => {
    expect(camposComErro(comAlteracao((d) => (d.qualificacoes_cursos = [])))).toEqual(["qualificacoes_cursos"]);
    expect(
      camposComErro(
        comAlteracao((d) =>
          d.qualificacoes_cursos.push({ nome_curso: "sistemas de informação", grau: "TECNICO", obrigatorio: false }),
        ),
      ),
    ).toEqual(["qualificacoes_cursos.2.nome_curso"]);
  });
});

describe("status da vaga", () => {
  it("segue as transições permitidas; encerrada é definitiva", () => {
    expect(podeMudarStatus("RASCUNHO", "ABERTA")).toBe(true);
    expect(podeMudarStatus("ABERTA", "PAUSADA")).toBe(true);
    expect(podeMudarStatus("PAUSADA", "ABERTA")).toBe(true);
    expect(podeMudarStatus("ABERTA", "RASCUNHO")).toBe(false);
    expect(podeMudarStatus("ENCERRADA", "ABERTA")).toBe(false);
  });
});

describe("filtrosVagasSchema", () => {
  it("ignora valores inválidos vindos da URL em vez de dar erro", () => {
    expect(filtrosVagasSchema.parse({ modalidade: "VOADOR", pagina: "-3", por_pagina: "999", busca: "  " })).toEqual({
      modalidade: undefined,
      pagina: 1,
      por_pagina: 12,
      busca: undefined,
      area: undefined,
      curso: undefined,
    });
  });
});
