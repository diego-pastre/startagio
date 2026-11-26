import { z } from "zod";
import { GRAUS_CURSO, NIVEIS_FORMACAO, NIVEIS_IDIOMA, STATUS_VAGA, TIPOS_MODELO, type StatusVaga } from "../enums";
import { hojeISO } from "../utils/datas";
import {
  booleano,
  dataOpcional,
  dinheiro,
  inteiro,
  inteiroOpcional,
  tags,
  textoObrigatorio,
  textoOpcional,
} from "./campos";

// Limites das seções 3.4, 3.5 e 4.2 (Tela 2) do PDF.
export const CARGA_HORARIA_MINIMA = 10;
/** Lei do Estágio (11.788/2008): no máximo 30 horas semanais. */
export const CARGA_HORARIA_MAXIMA = 30;
export const VALOR_BOLSA_MAXIMO = 99_999_999.99;
export const SEMESTRE_MAXIMO = 12;
export const QUANTIDADE_MAXIMA_CURSOS = 20;

/** Etapa 1 do assistente: tabela vagas. */
export const dadosGeraisVagaSchema = z.object({
  titulo: textoObrigatorio(120),
  area_atuacao: textoObrigatorio(80),
  tipo_modelo: z.enum(TIPOS_MODELO, "Escolha a modalidade"),
  carga_horaria_semanal: inteiro(CARGA_HORARIA_MINIMA, CARGA_HORARIA_MAXIMA, "horas"),
  valor_bolsa: dinheiro(VALOR_BOLSA_MAXIMO),
  auxilio_transporte: booleano(true),
  quantidade_posicoes: inteiro(1, 999),
  local_atuacao: textoOpcional(150),
  data_limite_inscricao: dataOpcional().refine(
    (data) => data === null || data >= hojeISO(),
    "A data limite não pode estar no passado",
  ),
  descricao: textoObrigatorio(5000),
  beneficios: textoOpcional(2000),
  /** A vaga nasce como rascunho ou já publicada. Pausar e encerrar vem depois. */
  status: z.enum(["RASCUNHO", "ABERTA"]).default("ABERTA"),
});

/** Etapa 2 do assistente: tabela perfil_desejado. */
export const perfilDesejadoSchema = z
  .object({
    nivel_formacao: z.enum(NIVEIS_FORMACAO, "Escolha o nível de formação"),
    semestre_minimo: inteiroOpcional(1, SEMESTRE_MAXIMO),
    semestre_maximo: inteiroOpcional(1, SEMESTRE_MAXIMO),
    idioma_exigido: textoOpcional(50),
    nivel_idioma: z
      .union([z.enum(NIVEIS_IDIOMA), z.literal("")])
      .nullish()
      .transform((nivel) => nivel || null),
    habilidades_tecnicas: tags(1000),
    competencias_comportamentais: tags(1000),
    requisitos_obrigatorios: textoOpcional(2000),
    requisitos_desejaveis: textoOpcional(2000),
  })
  .superRefine((perfil, ctx) => {
    if (perfil.semestre_minimo !== null && perfil.semestre_maximo !== null && perfil.semestre_maximo < perfil.semestre_minimo) {
      ctx.addIssue({ code: "custom", path: ["semestre_maximo"], message: "Não pode ser menor que o semestre mínimo" });
    }
    // Seção 3.5: com idioma preenchido, o nível passa a ser obrigatório.
    if (perfil.idioma_exigido && !perfil.nivel_idioma) {
      ctx.addIssue({ code: "custom", path: ["nivel_idioma"], message: "Escolha o nível do idioma" });
    }
  })
  .transform((perfil) => ({ ...perfil, nivel_idioma: perfil.idioma_exigido ? perfil.nivel_idioma : null }));

/** Uma linha da etapa 3: tabela qualificacoes_cursos. */
export const qualificacaoCursoSchema = z.object({
  nome_curso: textoObrigatorio(120),
  grau: z.enum(GRAUS_CURSO, "Escolha o grau"),
  obrigatorio: booleano(true),
});

/** Etapa 3 do assistente: pelo menos um curso, sem repetir. */
export const qualificacoesCursosSchema = z
  .array(qualificacaoCursoSchema, { error: "Adicione pelo menos um curso" })
  .min(1, "Adicione pelo menos um curso")
  .max(QUANTIDADE_MAXIMA_CURSOS, `No máximo ${QUANTIDADE_MAXIMA_CURSOS} cursos`)
  .superRefine((cursos, ctx) => {
    const vistos = new Set<string>();
    cursos.forEach((curso, indice) => {
      const chave = curso.nome_curso.toLocaleLowerCase("pt-BR");
      if (vistos.has(chave)) ctx.addIssue({ code: "custom", path: [indice, "nome_curso"], message: "Curso repetido" });
      vistos.add(chave);
    });
  });

/** POST /api/vagas: vagas, perfil_desejado e qualificacoes_cursos num envio só (seção 7.1 do PDF). */
export const novaVagaSchema = z.object({
  vaga: dadosGeraisVagaSchema,
  perfil_desejado: perfilDesejadoSchema,
  qualificacoes_cursos: qualificacoesCursosSchema,
});

export type NovaVagaInput = z.input<typeof novaVagaSchema>;
export type NovaVagaData = z.output<typeof novaVagaSchema>;

/** Mudanças de status que a empresa pode fazer. Encerrada é definitiva: é a exclusão lógica da seção 6.4 do PDF. */
export const TRANSICOES_STATUS_VAGA: Record<StatusVaga, readonly StatusVaga[]> = {
  RASCUNHO: ["ABERTA", "ENCERRADA"],
  ABERTA: ["PAUSADA", "ENCERRADA"],
  PAUSADA: ["ABERTA", "ENCERRADA"],
  ENCERRADA: [],
};

export function podeMudarStatus(de: StatusVaga, para: StatusVaga): boolean {
  return TRANSICOES_STATUS_VAGA[de].includes(para);
}

/** PATCH /api/vagas/:id/status */
export const alterarStatusVagaSchema = z.object({
  status: z.enum(STATUS_VAGA, "Status inválido"),
});

// Filtros vêm da URL: valor inválido é ignorado em vez de dar erro.
// O .optional() fica por último para a chave continuar opcional no tipo de saída.
const textoDeFiltro = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .catch("")
    .transform((valor) => valor || undefined)
    .optional();

export const POR_PAGINA_PADRAO = 12;
const pagina = z.coerce.number().int().min(1).catch(1);
const porPagina = z.coerce.number().int().min(1).max(50).catch(POR_PAGINA_PADRAO);

/** GET /api/vagas: mural do estudante (filtros da Tela 3 do PDF). */
export const filtrosVagasSchema = z.object({
  busca: textoDeFiltro(100),
  area: textoDeFiltro(80),
  modalidade: z.enum(TIPOS_MODELO).optional().catch(undefined),
  curso: textoDeFiltro(120),
  pagina,
  por_pagina: porPagina,
});

export type FiltrosVagas = z.output<typeof filtrosVagasSchema>;

/** GET /api/vagas/minhas: vagas da empresa logada. */
export const filtrosMinhasVagasSchema = z.object({
  status: z.enum(STATUS_VAGA).optional().catch(undefined),
  pagina,
  por_pagina: porPagina,
});

export type FiltrosMinhasVagas = z.output<typeof filtrosMinhasVagasSchema>;
