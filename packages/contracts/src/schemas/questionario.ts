import { z } from "zod";
import { decimal, textoObrigatorio, textoOpcional } from "./campos";

// Prova da vaga: tabelas questionarios e questoes (seções 3.6 e 6.3 do PDF).
// O enunciado de cada questão é um JSON gravado na coluna questoes.enunciado (TEXT).

export const ALTERNATIVAS = ["A", "B", "C", "D"] as const;
export type Alternativa = (typeof ALTERNATIVAS)[number];

export const QUANTIDADE_MAXIMA_QUESTOES = 30;
/** Nota de 0 a 10; o PDF sugere 6,00 como padrão para a nota mínima. */
export const NOTA_MAXIMA = 10;
export const NOTA_MINIMA_PADRAO = 6;

/** O JSON da coluna questoes.enunciado: pergunta, alternativas A a D e a letra certa. */
export const enunciadoSchema = z.object({
  pergunta: textoObrigatorio(1000),
  alternativas: z.object({
    A: textoObrigatorio(300),
    B: textoObrigatorio(300),
    C: textoObrigatorio(300),
    D: textoObrigatorio(300),
  }),
  correta: z.enum(ALTERNATIVAS, "Marque a alternativa correta"),
});

export type Enunciado = z.output<typeof enunciadoSchema>;

export const questaoSchema = z.object({
  /** DECIMAL(4,2) no banco: peso relativo da questão na média ponderada. */
  peso_nota: decimal(0.5, 10, 1),
  enunciado: enunciadoSchema,
});

/** Etapa 4 do assistente: tabela questionarios e a lista de questoes. */
export const questionarioSchema = z.object({
  titulo: textoObrigatorio(150),
  instrucoes: textoOpcional(2000),
  nota_minima_aprovacao: decimal(0, NOTA_MAXIMA, NOTA_MINIMA_PADRAO),
  questoes: z
    .array(questaoSchema, { error: "Adicione pelo menos uma questão" })
    .min(1, "Adicione pelo menos uma questão")
    .max(QUANTIDADE_MAXIMA_QUESTOES, `No máximo ${QUANTIDADE_MAXIMA_QUESTOES} questões`),
});

export type QuestionarioInput = z.input<typeof questionarioSchema>;
export type QuestionarioData = z.output<typeof questionarioSchema>;

/**
 * POST /api/vagas/:id/responder: a letra marcada em cada questão, pelo id da questão.
 * Ex.: { "respostas": { "12": "B", "13": "D" } }. Se todas foram respondidas, quem confere é a API.
 */
export const responderProvaSchema = z.object({
  respostas: z.record(z.string().regex(/^\d+$/, "Questão inválida"), z.enum(ALTERNATIVAS, "Alternativa inválida"), {
    error: "Envie as respostas",
  }),
});

export type ResponderProvaData = z.output<typeof responderProvaSchema>;
