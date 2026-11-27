import type {
  EditarVagaData,
  FiltrosMinhasVagas,
  FormularioDaVaga,
  FiltrosVagas,
  NovaVagaData,
  OpcoesFiltroVagas,
  Paginado,
  StatusVaga,
  VagaDetalhe,
  VagaResumo,
} from "@startagio/contracts";
import { api } from "@/lib/api";

export async function listarVagas(filtros: Partial<FiltrosVagas>): Promise<Paginado<VagaResumo>> {
  const { data } = await api.get<Paginado<VagaResumo>>("/vagas", { params: filtros });
  return data;
}

export async function buscarOpcoesFiltro(): Promise<OpcoesFiltroVagas> {
  const { data } = await api.get<OpcoesFiltroVagas>("/vagas/filtros");
  return data;
}

export async function listarMinhasVagas(filtros: Partial<FiltrosMinhasVagas>): Promise<Paginado<VagaResumo>> {
  const { data } = await api.get<Paginado<VagaResumo>>("/vagas/minhas", { params: filtros });
  return data;
}

export async function buscarVaga(id: number): Promise<VagaDetalhe> {
  const { data } = await api.get<VagaDetalhe>(`/vagas/${id}`);
  return data;
}

export async function criarVaga(dados: NovaVagaData): Promise<VagaDetalhe> {
  const { data } = await api.post<VagaDetalhe>("/vagas", dados);
  return data;
}

export async function buscarFormularioVaga(id: number): Promise<FormularioDaVaga> {
  const { data } = await api.get<FormularioDaVaga>(`/vagas/${id}/formulario`);
  return data;
}

export async function editarVaga({ id, dados }: { id: number; dados: EditarVagaData }): Promise<VagaDetalhe> {
  const { data } = await api.put<VagaDetalhe>(`/vagas/${id}`, dados);
  return data;
}

export async function alterarStatusVaga({ id, status }: { id: number; status: StatusVaga }): Promise<VagaDetalhe> {
  const { data } = await api.patch<VagaDetalhe>(`/vagas/${id}/status`, { status });
  return data;
}
