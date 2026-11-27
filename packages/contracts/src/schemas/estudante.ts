import { z } from "zod";
import { GRAUS_CURSO, NIVEIS_IDIOMA, STATUS_APROVACAO } from "../enums";
import { inteiro, textoObrigatorio, textoOpcional } from "./campos";
import { SEMESTRE_MAXIMO } from "./vaga";

/**
 * Perfil acadêmico do estudante (tabela perfil_estudante, que não existe no PDF).
 * Guarda curso, semestre e idioma, que o cálculo de afinidade da seção 6.3 compara com a vaga.
 */
export const perfilEstudanteSchema = z
  .object({
    curso: textoObrigatorio(120),
    grau: z.enum(GRAUS_CURSO, "Escolha o grau"),
    semestre_atual: inteiro(1, SEMESTRE_MAXIMO, "semestre"),
    instituicao_ensino: textoOpcional(150),
    idioma: textoOpcional(50),
    nivel_idioma: z
      .union([z.enum(NIVEIS_IDIOMA), z.literal("")])
      .nullish()
      .transform((nivel) => nivel || null),
  })
  .superRefine((perfil, ctx) => {
    // Mesma regra da vaga (seção 3.5): com idioma preenchido, o nível é obrigatório.
    if (perfil.idioma && !perfil.nivel_idioma) {
      ctx.addIssue({ code: "custom", path: ["nivel_idioma"], message: "Escolha o nível do idioma" });
    }
  })
  .transform((perfil) => ({ ...perfil, nivel_idioma: perfil.idioma ? perfil.nivel_idioma : null }));

export type PerfilEstudanteInput = z.input<typeof perfilEstudanteSchema>;
export type PerfilEstudanteData = z.output<typeof perfilEstudanteSchema>;

const pagina = z.coerce.number().int().min(1).catch(1);
const porPagina = z.coerce.number().int().min(1).max(50).catch(10);

/** GET /api/candidaturas: histórico do estudante logado. */
export const filtrosCandidaturasSchema = z.object({
  status: z.enum(STATUS_APROVACAO).optional().catch(undefined),
  pagina,
  por_pagina: porPagina,
});

export type FiltrosCandidaturas = z.output<typeof filtrosCandidaturasSchema>;

/** GET /api/vagas/:id/candidatos: ranking da vaga (Tela 4 do PDF). */
export const filtrosCandidatosSchema = filtrosCandidaturasSchema.extend({
  por_pagina: z.coerce.number().int().min(1).max(50).catch(20),
});

export type FiltrosCandidatos = z.output<typeof filtrosCandidatosSchema>;

/** PATCH /api/pontuacoes/:id/status: aprovar, reprovar ou voltar para análise. */
export const alterarStatusCandidaturaSchema = z.object({
  status: z.enum(STATUS_APROVACAO, "Status inválido"),
});
