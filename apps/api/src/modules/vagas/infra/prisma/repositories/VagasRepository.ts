import type {
  EditarVagaData,
  FiltrosMinhasVagas,
  FiltrosVagas,
  NovaVagaData,
  OpcoesFiltroVagas,
  Paginado,
  StatusVaga,
  VagaDetalhe,
  VagaResumo,
} from "@startagio/contracts";
import { lerEnunciado } from "@modules/candidaturas/utils/enunciado";
import { ConflictError } from "@shared/errors/AppError";
import { prisma } from "@shared/infra/prisma/client";
import type { Prisma } from "@shared/infra/prisma/models";
import { dataDoBanco, paraDataDoBanco } from "@shared/utils/datas";
import type { IVagasRepository } from "../../../repositories/IVagasRepository";
import { PROVA_TRAVADA } from "../../../utils/mensagens";

// Campos do card do mural: equivale aos JOINs da query 1 da seção 6.4 do PDF.
const selectResumo = {
  id: true,
  titulo: true,
  area_atuacao: true,
  tipo_modelo: true,
  carga_horaria_semanal: true,
  valor_bolsa: true,
  auxilio_transporte: true,
  local_atuacao: true,
  quantidade_posicoes: true,
  status: true,
  data_limite_inscricao: true,
  criado_em: true,
  empresa: { select: { id: true, nome_fantasia: true, cidade: true, estado: true } },
  perfil_desejado: { select: { nivel_formacao: true } },
  qualificacoes_cursos: { select: { nome_curso: true, grau: true, obrigatorio: true }, orderBy: { id: "asc" } },
  _count: { select: { pontuacoes: true } },
} satisfies Prisma.VagaSelect;

const includeDetalhe = {
  empresa: {
    select: {
      id: true,
      nome_fantasia: true,
      cidade: true,
      estado: true,
      ramo_atuacao: true,
      site: true,
      descricao_empresa: true,
    },
  },
  perfil_desejado: true,
  qualificacoes_cursos: { orderBy: { id: "asc" } },
  questionario: { select: { titulo: true, nota_minima_aprovacao: true, _count: { select: { questoes: true } } } },
  _count: { select: { pontuacoes: true } },
} satisfies Prisma.VagaInclude;

type VagaResumoDoBanco = Prisma.VagaGetPayload<{ select: typeof selectResumo }>;
type VagaDetalheDoBanco = Prisma.VagaGetPayload<{ include: typeof includeDetalhe }>;

// Decimal vira number e datas viram texto, no formato do contrato (packages/contracts).
function camposComuns(vaga: VagaResumoDoBanco | VagaDetalheDoBanco) {
  return {
    id: vaga.id,
    titulo: vaga.titulo,
    area_atuacao: vaga.area_atuacao,
    tipo_modelo: vaga.tipo_modelo,
    carga_horaria_semanal: vaga.carga_horaria_semanal,
    valor_bolsa: vaga.valor_bolsa.toNumber(),
    auxilio_transporte: vaga.auxilio_transporte,
    local_atuacao: vaga.local_atuacao,
    quantidade_posicoes: vaga.quantidade_posicoes,
    status: vaga.status,
    data_limite_inscricao: dataDoBanco(vaga.data_limite_inscricao),
    criado_em: vaga.criado_em.toISOString(),
    nivel_formacao: vaga.perfil_desejado?.nivel_formacao ?? null,
    cursos: vaga.qualificacoes_cursos.map(({ nome_curso, grau, obrigatorio }) => ({ nome_curso, grau, obrigatorio })),
    total_candidaturas: vaga._count.pontuacoes,
  };
}

/** Questões no formato do Prisma: o enunciado vira o JSON da seção 6.3 do PDF. */
function questoesParaGravar(questionario: NonNullable<EditarVagaData["questionario"]>) {
  return {
    create: questionario.questoes.map(({ peso_nota, enunciado }) => ({ peso_nota, enunciado: JSON.stringify(enunciado) })),
  };
}

function toResumo(vaga: VagaResumoDoBanco): VagaResumo {
  return { ...camposComuns(vaga), empresa: vaga.empresa };
}

function toDetalhe(vaga: VagaDetalheDoBanco): VagaDetalhe {
  const perfil = vaga.perfil_desejado;
  return {
    ...camposComuns(vaga),
    descricao: vaga.descricao,
    beneficios: vaga.beneficios,
    atualizado_em: vaga.atualizado_em.toISOString(),
    empresa: vaga.empresa,
    perfil_desejado: perfil && {
      nivel_formacao: perfil.nivel_formacao,
      semestre_minimo: perfil.semestre_minimo,
      semestre_maximo: perfil.semestre_maximo,
      idioma_exigido: perfil.idioma_exigido,
      nivel_idioma: perfil.nivel_idioma,
      habilidades_tecnicas: perfil.habilidades_tecnicas,
      competencias_comportamentais: perfil.competencias_comportamentais,
      requisitos_obrigatorios: perfil.requisitos_obrigatorios,
      requisitos_desejaveis: perfil.requisitos_desejaveis,
    },
    questionario: vaga.questionario && {
      titulo: vaga.questionario.titulo,
      nota_minima_aprovacao: vaga.questionario.nota_minima_aprovacao.toNumber(),
      total_questoes: vaga.questionario._count.questoes,
    },
    // Depende de quem pergunta: o FindVagaService preenche para o estudante.
    minha_candidatura: null,
  };
}

/** status = 'Aberta' e (sem data limite ou data limite >= hoje), como no WHERE da seção 6.4 do PDF. */
function abertasNoPrazo(hoje: string): Prisma.VagaWhereInput {
  return {
    status: "ABERTA",
    OR: [{ data_limite_inscricao: null }, { data_limite_inscricao: { gte: paraDataDoBanco(hoje) } }],
  };
}

export class VagasRepository implements IVagasRepository {
  async create(
    empresaId: number,
    { vaga, perfil_desejado, qualificacoes_cursos, questionario }: NovaVagaData,
  ): Promise<VagaDetalhe> {
    // Escrita aninhada: o Prisma grava as cinco tabelas numa transação só, como pede a seção 6.2 do PDF.
    const criada = await prisma.vaga.create({
      data: {
        ...vaga,
        empresa_id: empresaId,
        data_limite_inscricao: vaga.data_limite_inscricao ? paraDataDoBanco(vaga.data_limite_inscricao) : null,
        perfil_desejado: { create: perfil_desejado },
        qualificacoes_cursos: { create: qualificacoes_cursos },
        questionario: {
          create: {
            titulo: questionario.titulo,
            instrucoes: questionario.instrucoes,
            nota_minima_aprovacao: questionario.nota_minima_aprovacao,
            questoes: questoesParaGravar(questionario),
          },
        },
      },
      include: includeDetalhe,
    });
    return toDetalhe(criada);
  }

  async update(
    id: number,
    { vaga, perfil_desejado, qualificacoes_cursos, questionario }: EditarVagaData,
  ): Promise<VagaDetalhe> {
    const atualizada = await prisma.$transaction(async (tx) => {
      if (questionario) {
        // Confere de novo dentro da transação: uma candidatura pode ter chegado depois da checagem do service.
        if (await tx.pontuacao.count({ where: { vaga_id: id } })) throw new ConflictError(PROVA_TRAVADA);
        const dadosDaProva = {
          titulo: questionario.titulo,
          instrucoes: questionario.instrucoes,
          nota_minima_aprovacao: questionario.nota_minima_aprovacao,
        };
        const existente = await tx.questionario.findUnique({ where: { vaga_id: id }, select: { id: true } });
        if (existente) {
          await tx.questao.deleteMany({ where: { questionario_id: existente.id } });
          await tx.questionario.update({
            where: { id: existente.id },
            data: { ...dadosDaProva, questoes: questoesParaGravar(questionario) },
          });
        } else {
          // Vaga antiga, sem prova: a edição cria a prova.
          await tx.questionario.create({ data: { ...dadosDaProva, vaga_id: id, questoes: questoesParaGravar(questionario) } });
        }
      }

      // Cursos são uma lista: troca a lista inteira.
      await tx.qualificacaoCurso.deleteMany({ where: { vaga_id: id } });
      return tx.vaga.update({
        where: { id },
        data: {
          ...vaga,
          data_limite_inscricao: vaga.data_limite_inscricao ? paraDataDoBanco(vaga.data_limite_inscricao) : null,
          perfil_desejado: { upsert: { create: perfil_desejado, update: perfil_desejado } },
          qualificacoes_cursos: { create: qualificacoes_cursos },
        },
        include: includeDetalhe,
      });
    });
    return toDetalhe(atualizada);
  }

  async findFormulario(id: number): Promise<EditarVagaData | null> {
    const vaga = await prisma.vaga.findUnique({
      where: { id },
      include: {
        perfil_desejado: true,
        qualificacoes_cursos: { orderBy: { id: "asc" } },
        questionario: { include: { questoes: { orderBy: { id: "asc" } } } },
      },
    });
    if (!vaga) return null;
    const perfil = vaga.perfil_desejado;
    return {
      vaga: {
        titulo: vaga.titulo,
        area_atuacao: vaga.area_atuacao,
        tipo_modelo: vaga.tipo_modelo,
        carga_horaria_semanal: vaga.carga_horaria_semanal,
        valor_bolsa: vaga.valor_bolsa.toNumber(),
        auxilio_transporte: vaga.auxilio_transporte,
        quantidade_posicoes: vaga.quantidade_posicoes,
        local_atuacao: vaga.local_atuacao,
        data_limite_inscricao: dataDoBanco(vaga.data_limite_inscricao),
        descricao: vaga.descricao,
        beneficios: vaga.beneficios,
      },
      perfil_desejado: {
        nivel_formacao: perfil?.nivel_formacao ?? "BACHARELADO",
        semestre_minimo: perfil?.semestre_minimo ?? null,
        semestre_maximo: perfil?.semestre_maximo ?? null,
        idioma_exigido: perfil?.idioma_exigido ?? null,
        nivel_idioma: perfil?.nivel_idioma ?? null,
        habilidades_tecnicas: perfil?.habilidades_tecnicas ?? null,
        competencias_comportamentais: perfil?.competencias_comportamentais ?? null,
        requisitos_obrigatorios: perfil?.requisitos_obrigatorios ?? null,
        requisitos_desejaveis: perfil?.requisitos_desejaveis ?? null,
      },
      qualificacoes_cursos: vaga.qualificacoes_cursos.map(({ nome_curso, grau, obrigatorio }) => ({ nome_curso, grau, obrigatorio })),
      questionario: vaga.questionario
        ? {
            titulo: vaga.questionario.titulo,
            instrucoes: vaga.questionario.instrucoes,
            nota_minima_aprovacao: vaga.questionario.nota_minima_aprovacao.toNumber(),
            questoes: vaga.questionario.questoes.map((questao) => ({
              peso_nota: questao.peso_nota.toNumber(),
              enunciado: lerEnunciado(questao.enunciado),
            })),
          }
        : undefined,
    };
  }

  async findById(id: number): Promise<VagaDetalhe | null> {
    const vaga = await prisma.vaga.findUnique({ where: { id }, include: includeDetalhe });
    return vaga && toDetalhe(vaga);
  }

  listAbertas(filtros: FiltrosVagas, hoje: string): Promise<Paginado<VagaResumo>> {
    const busca = filtros.busca;
    return this.paginar(
      {
        AND: [
          abertasNoPrazo(hoje),
          busca
            ? {
                OR: [
                  { titulo: { contains: busca } },
                  { area_atuacao: { contains: busca } },
                  { empresa: { nome_fantasia: { contains: busca } } },
                ],
              }
            : {},
        ],
        area_atuacao: filtros.area,
        tipo_modelo: filtros.modalidade,
        qualificacoes_cursos: filtros.curso ? { some: { nome_curso: filtros.curso } } : undefined,
      },
      filtros,
    );
  }

  listByEmpresa(empresaId: number, filtros: FiltrosMinhasVagas): Promise<Paginado<VagaResumo>> {
    return this.paginar({ empresa_id: empresaId, status: filtros.status }, filtros);
  }

  async updateStatus(id: number, status: StatusVaga): Promise<VagaDetalhe> {
    const vaga = await prisma.vaga.update({ where: { id }, data: { status }, include: includeDetalhe });
    return toDetalhe(vaga);
  }

  async listOpcoesFiltro(hoje: string): Promise<OpcoesFiltroVagas> {
    const abertas = abertasNoPrazo(hoje);
    const [areas, cursos] = await Promise.all([
      prisma.vaga.findMany({
        where: abertas,
        distinct: ["area_atuacao"],
        select: { area_atuacao: true },
        orderBy: { area_atuacao: "asc" },
      }),
      prisma.qualificacaoCurso.findMany({
        where: { vaga: abertas },
        distinct: ["nome_curso"],
        select: { nome_curso: true },
        orderBy: { nome_curso: "asc" },
      }),
    ]);
    return { areas: areas.map((vaga) => vaga.area_atuacao), cursos: cursos.map((curso) => curso.nome_curso) };
  }

  private async paginar(
    where: Prisma.VagaWhereInput,
    { pagina, por_pagina }: { pagina: number; por_pagina: number },
  ): Promise<Paginado<VagaResumo>> {
    const [total, vagas] = await prisma.$transaction([
      prisma.vaga.count({ where }),
      prisma.vaga.findMany({
        where,
        select: selectResumo,
        orderBy: [{ criado_em: "desc" }, { id: "desc" }],
        skip: (pagina - 1) * por_pagina,
        take: por_pagina,
      }),
    ]);
    return {
      dados: vagas.map(toResumo),
      total,
      pagina,
      por_pagina,
      total_paginas: Math.max(1, Math.ceil(total / por_pagina)),
    };
  }
}
