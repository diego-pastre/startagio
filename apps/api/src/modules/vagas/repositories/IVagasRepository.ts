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

export interface IVagasRepository {
  /** Grava vaga, perfil desejado, cursos, questionário e questões numa transação só (seção 6.2 do PDF). */
  create(empresaId: number, data: NovaVagaData): Promise<VagaDetalhe>;
  /** Atualiza a vaga inteira numa transação. Sem `questionario`, a prova fica como está. */
  update(id: number, data: EditarVagaData): Promise<VagaDetalhe>;
  /** A vaga completa, com o gabarito da prova, no formato do formulário de edição. */
  findFormulario(id: number): Promise<EditarVagaData | null>;
  findById(id: number): Promise<VagaDetalhe | null>;
  /** Vagas com status ABERTA e inscrição no prazo (`hoje` no formato YYYY-MM-DD), das mais novas para as mais antigas. */
  listAbertas(filtros: FiltrosVagas, hoje: string): Promise<Paginado<VagaResumo>>;
  listByEmpresa(empresaId: number, filtros: FiltrosMinhasVagas): Promise<Paginado<VagaResumo>>;
  updateStatus(id: number, status: StatusVaga): Promise<VagaDetalhe>;
  /** Áreas e cursos que aparecem nas vagas abertas, para os filtros do mural. */
  listOpcoesFiltro(hoje: string): Promise<OpcoesFiltroVagas>;
}
