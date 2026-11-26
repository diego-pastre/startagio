import type {
  FiltrosMinhasVagas,
  FiltrosVagas,
  NovaVagaData,
  OpcoesFiltroVagas,
  Paginado,
  StatusVaga,
  VagaDetalhe,
  VagaResumo,
} from "@startagio/contracts";
import type { IVagasRepository } from "../IVagasRepository";

type EmpresaDaVaga = VagaDetalhe["empresa"];

function empresaPadrao(id: number): EmpresaDaVaga {
  return { id, nome_fantasia: `Empresa ${id}`, cidade: "Ipatinga", estado: "MG", ramo_atuacao: null, site: null, descricao_empresa: null };
}

function toResumo({ descricao, beneficios, atualizado_em, perfil_desejado, empresa, ...resumo }: VagaDetalhe): VagaResumo {
  return { ...resumo, empresa: { id: empresa.id, nome_fantasia: empresa.nome_fantasia, cidade: empresa.cidade, estado: empresa.estado } };
}

export class FakeVagasRepository implements IVagasRepository {
  private vagas: VagaDetalhe[] = [];
  // Cada vaga criada fica 1 minuto mais nova que a anterior, para a ordenação ser previsível.
  private relogio = Date.parse("2026-01-01T12:00:00.000Z");

  constructor(private empresas: Record<number, EmpresaDaVaga> = {}) {}

  async create(empresaId: number, { vaga, perfil_desejado, qualificacoes_cursos }: NovaVagaData): Promise<VagaDetalhe> {
    this.relogio += 60_000;
    const agora = new Date(this.relogio).toISOString();
    const nova: VagaDetalhe = {
      ...vaga,
      id: this.vagas.length + 1,
      criado_em: agora,
      atualizado_em: agora,
      empresa: this.empresas[empresaId] ?? empresaPadrao(empresaId),
      nivel_formacao: perfil_desejado.nivel_formacao,
      perfil_desejado: { ...perfil_desejado },
      cursos: qualificacoes_cursos.map((curso) => ({ ...curso })),
    };
    this.vagas.push(nova);
    return nova;
  }

  async findById(id: number): Promise<VagaDetalhe | null> {
    return this.vagas.find((vaga) => vaga.id === id) ?? null;
  }

  async listAbertas(filtros: FiltrosVagas, hoje: string): Promise<Paginado<VagaResumo>> {
    const busca = filtros.busca?.toLocaleLowerCase("pt-BR");
    const contem = (texto: string) => (busca ? texto.toLocaleLowerCase("pt-BR").includes(busca) : true);
    return this.paginar(
      this.vagas.filter(
        (vaga) =>
          vaga.status === "ABERTA" &&
          (vaga.data_limite_inscricao === null || vaga.data_limite_inscricao >= hoje) &&
          (!filtros.area || vaga.area_atuacao === filtros.area) &&
          (!filtros.modalidade || vaga.tipo_modelo === filtros.modalidade) &&
          (!filtros.curso || vaga.cursos.some((curso) => curso.nome_curso === filtros.curso)) &&
          (contem(vaga.titulo) || contem(vaga.area_atuacao) || contem(vaga.empresa.nome_fantasia)),
      ),
      filtros,
    );
  }

  async listByEmpresa(empresaId: number, filtros: FiltrosMinhasVagas): Promise<Paginado<VagaResumo>> {
    return this.paginar(
      this.vagas.filter((vaga) => vaga.empresa.id === empresaId && (!filtros.status || vaga.status === filtros.status)),
      filtros,
    );
  }

  async updateStatus(id: number, status: StatusVaga): Promise<VagaDetalhe> {
    const vaga = this.vagas.find((item) => item.id === id);
    if (!vaga) throw new Error(`Vaga ${id} não existe no fake`);
    vaga.status = status;
    return vaga;
  }

  async listOpcoesFiltro(hoje: string): Promise<OpcoesFiltroVagas> {
    const { dados } = await this.listAbertas({ pagina: 1, por_pagina: Number.MAX_SAFE_INTEGER }, hoje);
    const ordenar = (valores: string[]) => [...new Set(valores)].sort((a, b) => a.localeCompare(b, "pt-BR"));
    return {
      areas: ordenar(dados.map((vaga) => vaga.area_atuacao)),
      cursos: ordenar(dados.flatMap((vaga) => vaga.cursos.map((curso) => curso.nome_curso))),
    };
  }

  /** Só para testes: simula uma vaga cuja data limite já passou. */
  alterarDataLimite(id: number, data: string): void {
    const vaga = this.vagas.find((item) => item.id === id);
    if (vaga) vaga.data_limite_inscricao = data;
  }

  private paginar(vagas: VagaDetalhe[], { pagina, por_pagina }: { pagina: number; por_pagina: number }): Paginado<VagaResumo> {
    const ordenadas = [...vagas].sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id);
    return {
      dados: ordenadas.slice((pagina - 1) * por_pagina, pagina * por_pagina).map(toResumo),
      total: vagas.length,
      pagina,
      por_pagina,
      total_paginas: Math.max(1, Math.ceil(vagas.length / por_pagina)),
    };
  }
}
