import type { DefaultValues } from "react-hook-form";
import { formatarMoedaDigitando, type EditarVagaData, type NovaVagaInput } from "@startagio/contracts";
import { formatarNota } from "@/utils/candidaturas";
import { questaoVazia } from "./etapa-questionario";

/** Assistente vazio, para uma vaga nova. */
export const VALORES_DA_VAGA_NOVA: DefaultValues<NovaVagaInput> = {
  vaga: {
    titulo: "",
    area_atuacao: "",
    tipo_modelo: "PRESENCIAL",
    carga_horaria_semanal: "",
    valor_bolsa: "",
    auxilio_transporte: true,
    quantidade_posicoes: "1",
    local_atuacao: "",
    data_limite_inscricao: "",
    descricao: "",
    beneficios: "",
    status: "ABERTA",
  },
  perfil_desejado: {
    semestre_minimo: "1",
    semestre_maximo: "",
    idioma_exigido: "",
    nivel_idioma: "",
    habilidades_tecnicas: "",
    competencias_comportamentais: "",
    requisitos_obrigatorios: "",
    requisitos_desejaveis: "",
  },
  qualificacoes_cursos: [{ nome_curso: "", grau: "GRADUACAO", obrigatorio: true }],
  questionario: {
    titulo: "",
    instrucoes: "",
    nota_minima_aprovacao: "6,00",
    questoes: [questaoVazia()],
  },
};

const texto = (valor: string | number | null) => (valor === null ? "" : String(valor));
/** 1.5 → "1,5": o peso aparece no campo como a pessoa digitaria. */
const decimal = (valor: number) => String(valor).replace(".", ",");

/**
 * Vaga salva (GET /api/vagas/:id/formulario) → valores do assistente, no formato em que a pessoa digita:
 * bolsa com máscara ("1.350,00"), números como texto e nulos como campo vazio.
 * O status não muda pela edição (vai pelo PATCH /status): fica "ABERTA" só para passar na validação.
 */
export function valoresDaVagaSalva({ vaga, perfil_desejado: perfil, qualificacoes_cursos, questionario }: EditarVagaData): NovaVagaInput {
  return {
    vaga: {
      ...vaga,
      carga_horaria_semanal: texto(vaga.carga_horaria_semanal),
      valor_bolsa: vaga.valor_bolsa > 0 ? formatarMoedaDigitando(vaga.valor_bolsa.toFixed(2)) : "",
      quantidade_posicoes: texto(vaga.quantidade_posicoes),
      local_atuacao: texto(vaga.local_atuacao),
      data_limite_inscricao: texto(vaga.data_limite_inscricao),
      beneficios: texto(vaga.beneficios),
      status: "ABERTA",
    },
    perfil_desejado: {
      nivel_formacao: perfil.nivel_formacao,
      semestre_minimo: texto(perfil.semestre_minimo),
      semestre_maximo: texto(perfil.semestre_maximo),
      idioma_exigido: texto(perfil.idioma_exigido),
      nivel_idioma: perfil.nivel_idioma ?? "",
      habilidades_tecnicas: texto(perfil.habilidades_tecnicas),
      competencias_comportamentais: texto(perfil.competencias_comportamentais),
      requisitos_obrigatorios: texto(perfil.requisitos_obrigatorios),
      requisitos_desejaveis: texto(perfil.requisitos_desejaveis),
    },
    qualificacoes_cursos: qualificacoes_cursos.map((curso) => ({ ...curso })),
    // Vaga antiga, sem prova: a edição começa com uma questão em branco para a empresa criar a prova.
    questionario: questionario
      ? {
          titulo: questionario.titulo,
          instrucoes: texto(questionario.instrucoes),
          nota_minima_aprovacao: formatarNota(questionario.nota_minima_aprovacao),
          questoes: questionario.questoes.map(({ peso_nota, enunciado }) => ({
            peso_nota: decimal(peso_nota),
            enunciado: { ...enunciado, alternativas: { ...enunciado.alternativas } },
          })),
        }
      : { titulo: "", instrucoes: "", nota_minima_aprovacao: "6,00", questoes: [questaoVazia()] },
  };
}
