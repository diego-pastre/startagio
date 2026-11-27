import type {
  GrauCurso,
  NivelAcesso,
  NivelFormacao,
  NivelIdioma,
  StatusAprovacao,
  StatusVaga,
  TipoModelo,
} from "../enums";
import type { EmpresaData } from "../schemas/empresa";
import type { PerfilEstudanteData } from "../schemas/estudante";
import type { EditarVagaData } from "../schemas/vaga";
import type { Alternativa } from "../schemas/questionario";

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
  /** Quantas pessoas já fizeram a prova. Com 1 ou mais, a prova da vaga não muda mais. */
  total_candidaturas: number;
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
  /** Resumo da prova. null em vaga antiga, criada antes da prova ser obrigatória. */
  questionario: ResumoQuestionario | null;
  /** Só para o estudante logado: a candidatura dele nesta vaga (o "ja_candidatou" da Tela 3 do PDF). */
  minha_candidatura: ResumoCandidatura | null;
}

export interface ResumoQuestionario {
  titulo: string;
  nota_minima_aprovacao: number;
  total_questoes: number;
}

export interface ResumoCandidatura {
  id: number;
  nota_obtida: number;
  status_aprovacao: StatusAprovacao;
}

/** Questão como o estudante recebe: sem a chave "correta" (seção 6.3 do PDF). */
export interface QuestaoDaProva {
  id: number;
  peso_nota: number;
  pergunta: string;
  alternativas: Record<Alternativa, string>;
}

/** Resposta de GET /api/vagas/:id/questionario. */
export interface ProvaDaVaga {
  vaga: { id: number; titulo: string; empresa: { nome_fantasia: string } };
  id: number;
  titulo: string;
  instrucoes: string | null;
  nota_minima_aprovacao: number;
  questoes: QuestaoDaProva[];
}

/** Resposta de GET /api/vagas/:id/formulario: a vaga completa, com gabarito, para a empresa editar. */
export interface FormularioDaVaga {
  /** Sem `questionario` em vaga antiga, criada antes da prova ser obrigatória: a edição pode criar a prova. */
  dados: EditarVagaData;
  /** true quando alguém já respondeu: a prova aparece só para leitura e não vai no PUT. */
  prova_travada: boolean;
}

/** Uma linha do ranking da vaga (Tela 4 do PDF). */
export interface CandidatoDaVaga {
  /** id da linha em pontuacoes. */
  id: number;
  /** Posição no ranking completo da vaga: nota, depois afinidade, depois quem terminou antes. */
  posicao: number;
  estudante: { id: number; nome_completo: string; email: string; telefone: string; cpf: string };
  perfil: { curso: string; semestre_atual: number; instituicao_ensino: string | null } | null;
  nota_obtida: number;
  pontuacao_afinidade: number | null;
  status_aprovacao: StatusAprovacao;
  acertos: number;
  total_questoes: number;
  data_conclusao: string;
}

/** Resposta de GET /api/vagas/:id/candidatos. */
export interface RankingDaVaga {
  vaga: { id: number; titulo: string; status: StatusVaga };
  nota_minima_aprovacao: number;
  /** Quantos candidatos em cada situação, para as abas. */
  contagem: Record<StatusAprovacao | "TODOS", number>;
  candidatos: Paginado<CandidatoDaVaga>;
}

/** Resposta de GET/PUT /api/estudantes/perfil. */
export interface PerfilEstudante extends PerfilEstudanteData {
  id: number;
  usuario_id: number;
  atualizado_em: string;
}

/** Uma linha de "Minhas candidaturas" (tabela pontuacoes) e a resposta de POST /api/vagas/:id/responder. */
export interface Candidatura {
  id: number;
  vaga: {
    id: number;
    titulo: string;
    area_atuacao: string;
    tipo_modelo: TipoModelo;
    status: StatusVaga;
    empresa: EmpresaDaVaga;
  };
  /** De 0 a 10. */
  nota_obtida: number;
  nota_minima_aprovacao: number;
  /** De 0 a 100. null se não deu para calcular. */
  pontuacao_afinidade: number | null;
  status_aprovacao: StatusAprovacao;
  acertos: number;
  total_questoes: number;
  /** Instante ISO (UTC). */
  data_conclusao: string;
}

/** Valores existentes nas vagas abertas, para os filtros do mural. */
export interface OpcoesFiltroVagas {
  areas: string[];
  cursos: string[];
}
