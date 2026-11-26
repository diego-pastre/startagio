import type { GrauCurso, NivelAcesso, NivelFormacao, NivelIdioma, StatusVaga, TipoModelo } from "../enums";
import type { EmpresaData } from "../schemas/empresa";

/** Corpo de toda resposta de erro da API. `campos` traz a mensagem de cada campo inválido. */
export interface ApiErro {
  mensagem: string;
  campos?: Record<string, string>;
}

/** As quatro flags da tabela permissoes (seção 3.2 do PDF). */
export interface Permissoes {
  pode_criar_vagas: boolean;
  pode_candidatar: boolean;
  pode_ver_candidatos: boolean;
  pode_validar_estagio: boolean;
}

export type Permissao = keyof Permissoes;

/** Resposta de login, cadastro e GET /api/auth/me. Nunca leva a senha. */
export interface UsuarioAutenticado {
  id: number;
  usuario: string;
  nome_completo: string;
  email: string;
  nivel_acesso: NivelAcesso;
  permissoes: Permissoes;
  empresa: { id: number; nome_fantasia: string } | null;
}

/** Resposta de GET/POST/PUT /api/empresas. Datas chegam como texto ISO. */
export interface Empresa extends EmpresaData {
  id: number;
  usuario_id: number;
  criado_em: string;
  atualizado_em: string;
}

/** Resposta de toda listagem paginada. */
export interface Paginado<T> {
  dados: T[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface CursoDaVaga {
  nome_curso: string;
  grau: GrauCurso;
  obrigatorio: boolean;
}

export interface EmpresaDaVaga {
  id: number;
  nome_fantasia: string;
  cidade: string;
  estado: string;
}

/** Item do mural e da lista "Minhas vagas" (query 1 da seção 6.4 do PDF). */
export interface VagaResumo {
  id: number;
  titulo: string;
  area_atuacao: string;
  tipo_modelo: TipoModelo;
  carga_horaria_semanal: number;
  valor_bolsa: number;
  auxilio_transporte: boolean;
  local_atuacao: string | null;
  quantidade_posicoes: number;
  status: StatusVaga;
  /** Coluna DATE: "YYYY-MM-DD", sem hora. */
  data_limite_inscricao: string | null;
  /** Instante ISO (UTC). */
  criado_em: string;
  empresa: EmpresaDaVaga;
  nivel_formacao: NivelFormacao | null;
  cursos: CursoDaVaga[];
}

export interface PerfilDesejado {
  nivel_formacao: NivelFormacao;
  semestre_minimo: number | null;
  semestre_maximo: number | null;
  idioma_exigido: string | null;
  nivel_idioma: NivelIdioma | null;
  /** Separadas por vírgula. */
  habilidades_tecnicas: string | null;
  /** Separadas por vírgula. */
  competencias_comportamentais: string | null;
  /** Um item por linha. */
  requisitos_obrigatorios: string | null;
  /** Um item por linha. */
  requisitos_desejaveis: string | null;
}

/** Resposta de GET /api/vagas/:id e da criação. */
export interface VagaDetalhe extends Omit<VagaResumo, "empresa"> {
  descricao: string;
  beneficios: string | null;
  atualizado_em: string;
  empresa: EmpresaDaVaga & { ramo_atuacao: string | null; site: string | null; descricao_empresa: string | null };
  perfil_desejado: PerfilDesejado | null;
}

/** Valores existentes nas vagas abertas, para os filtros do mural. */
export interface OpcoesFiltroVagas {
  areas: string[];
  cursos: string[];
}
