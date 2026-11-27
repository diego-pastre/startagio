// Códigos dos enums usados na API e no front, com o rótulo de tela de cada um.
// No banco o Prisma grava o valor do PDF ('Instituição de ensino'); ver apps/api/prisma/schema.prisma.
// O teste apps/api/src/__tests__/enums.test.ts garante que as listas daqui e do schema não se separem.

export const NIVEIS_ACESSO = ["ESTUDANTE", "EMPRESA", "INSTITUICAO_ENSINO"] as const;
export type NivelAcesso = (typeof NIVEIS_ACESSO)[number];
export const NIVEL_ACESSO_LABEL: Record<NivelAcesso, string> = {
  ESTUDANTE: "Estudante",
  EMPRESA: "Empresa",
  INSTITUICAO_ENSINO: "Instituição de ensino",
};

/**
 * Perfis que qualquer pessoa pode escolher no cadastro do site. A conta de instituição de ensino
 * é criada à mão (ver docs/arquitetura.md), porque ela vê vagas em rascunho e vai validar estágios.
 */
export const NIVEIS_CADASTRO_PUBLICO = ["ESTUDANTE", "EMPRESA"] as const satisfies readonly NivelAcesso[];
export type NivelCadastroPublico = (typeof NIVEIS_CADASTRO_PUBLICO)[number];

export const TIPOS_MODELO = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const;
export type TipoModelo = (typeof TIPOS_MODELO)[number];
export const TIPO_MODELO_LABEL: Record<TipoModelo, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

export const STATUS_VAGA = ["RASCUNHO", "ABERTA", "PAUSADA", "ENCERRADA"] as const;
export type StatusVaga = (typeof STATUS_VAGA)[number];
export const STATUS_VAGA_LABEL: Record<StatusVaga, string> = {
  RASCUNHO: "Rascunho",
  ABERTA: "Aberta",
  PAUSADA: "Pausada",
  ENCERRADA: "Encerrada",
};

export const NIVEIS_FORMACAO = ["ENSINO_MEDIO", "TECNICO", "TECNOLOGO", "BACHARELADO", "LICENCIATURA"] as const;
export type NivelFormacao = (typeof NIVEIS_FORMACAO)[number];
export const NIVEL_FORMACAO_LABEL: Record<NivelFormacao, string> = {
  ENSINO_MEDIO: "Ensino Médio",
  TECNICO: "Técnico",
  TECNOLOGO: "Tecnólogo",
  BACHARELADO: "Bacharelado",
  LICENCIATURA: "Licenciatura",
};

export const NIVEIS_IDIOMA = ["BASICO", "INTERMEDIARIO", "AVANCADO", "FLUENTE"] as const;
export type NivelIdioma = (typeof NIVEIS_IDIOMA)[number];
export const NIVEL_IDIOMA_LABEL: Record<NivelIdioma, string> = {
  BASICO: "Básico",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
  FLUENTE: "Fluente",
};

export const GRAUS_CURSO = ["TECNICO", "GRADUACAO", "POS_GRADUACAO"] as const;
export type GrauCurso = (typeof GRAUS_CURSO)[number];
export const GRAU_CURSO_LABEL: Record<GrauCurso, string> = {
  TECNICO: "Técnico",
  GRADUACAO: "Graduação",
  POS_GRADUACAO: "Pós-Graduação",
};

export const STATUS_APROVACAO = ["APROVADO", "REPROVADO", "EM_ANALISE"] as const;
export type StatusAprovacao = (typeof STATUS_APROVACAO)[number];
export const STATUS_APROVACAO_LABEL: Record<StatusAprovacao, string> = {
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  EM_ANALISE: "Em análise",
};

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
export type Uf = (typeof UFS)[number];
