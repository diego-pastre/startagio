import {
  novaVagaSchema,
  type NovaVagaData,
  type NovaVagaInput,
  type Permissoes,
  type UsuarioAutenticado,
} from "@startagio/contracts";

/** Vaga válida, passando pelo mesmo schema que a API usa. `alterar` ajusta o que o teste precisar. */
export function novaVaga(alterar?: (dados: NovaVagaInput) => void): NovaVagaData {
  const dados: NovaVagaInput = {
    vaga: {
      titulo: "Estágio em Desenvolvimento Web",
      descricao: "Apoiar o time de produto no front-end.",
      area_atuacao: "Tecnologia da Informação",
      tipo_modelo: "HIBRIDO",
      carga_horaria_semanal: 30,
      valor_bolsa: 1350,
      quantidade_posicoes: 2,
      data_limite_inscricao: "2099-12-31",
    },
    perfil_desejado: { nivel_formacao: "BACHARELADO" },
    qualificacoes_cursos: [{ nome_curso: "Sistemas de Informação", grau: "GRADUACAO" }],
    questionario: {
      titulo: "Prova técnica",
      questoes: [
        { peso_nota: 2, enunciado: { pergunta: "Q1", alternativas: { A: "a", B: "b", C: "c", D: "d" }, correta: "B" } },
        { peso_nota: 1, enunciado: { pergunta: "Q2", alternativas: { A: "a", B: "b", C: "c", D: "d" }, correta: "A" } },
        { peso_nota: 1, enunciado: { pergunta: "Q3", alternativas: { A: "a", B: "b", C: "c", D: "d" }, correta: "D" } },
      ],
    },
  };
  alterar?.(dados);
  return novaVagaSchema.parse(dados);
}

const NENHUMA: Permissoes = {
  pode_criar_vagas: false,
  pode_candidatar: false,
  pode_ver_candidatos: false,
  pode_validar_estagio: false,
};

export function usuarioEmpresa(empresaId: number | null): UsuarioAutenticado {
  return {
    id: 100 + (empresaId ?? 0),
    usuario: `empresa${empresaId}`,
    nome_completo: "Responsável",
    email: `rh${empresaId}@empresa.com`,
    nivel_acesso: "EMPRESA",
    permissoes: { ...NENHUMA, pode_criar_vagas: true, pode_ver_candidatos: true },
    empresa: empresaId === null ? null : { id: empresaId, nome_fantasia: `Empresa ${empresaId}` },
  };
}

export const estudante: UsuarioAutenticado = {
  id: 1,
  usuario: "ana",
  nome_completo: "Ana Souza",
  email: "ana@exemplo.com",
  nivel_acesso: "ESTUDANTE",
  permissoes: { ...NENHUMA, pode_candidatar: true },
  empresa: null,
};

export const instituicao: UsuarioAutenticado = {
  id: 2,
  usuario: "favale",
  nome_completo: "Coordenação de Estágio",
  email: "estagio@favale.edu.br",
  nivel_acesso: "INSTITUICAO_ENSINO",
  permissoes: { ...NENHUMA, pode_validar_estagio: true },
  empresa: null,
};
