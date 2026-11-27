import type {
  Candidatura,
  FiltrosCandidatos,
  FiltrosCandidaturas,
  Paginado,
  ProvaDaVaga,
  RankingDaVaga,
  ResponderProvaData,
  StatusAprovacao,
} from "@startagio/contracts";
import { api } from "@/lib/api";

export async function buscarProva(vagaId: number): Promise<ProvaDaVaga> {
  const { data } = await api.get<ProvaDaVaga>(`/vagas/${vagaId}/questionario`);
  return data;
}

export async function responderProva({
  vagaId,
  respostas,
}: { vagaId: number } & ResponderProvaData): Promise<Candidatura> {
  const { data } = await api.post<Candidatura>(`/vagas/${vagaId}/responder`, { respostas });
  return data;
}

export async function listarCandidatos(vagaId: number, filtros: Partial<FiltrosCandidatos>): Promise<RankingDaVaga> {
  const { data } = await api.get<RankingDaVaga>(`/vagas/${vagaId}/candidatos`, { params: filtros });
  return data;
}

export async function alterarStatusCandidatura({ id, status }: { id: number; status: StatusAprovacao }) {
  const { data } = await api.patch<{ id: number; status_aprovacao: StatusAprovacao }>(`/pontuacoes/${id}/status`, {
    status,
  });
  return data;
}

export async function listarMinhasCandidaturas(filtros: Partial<FiltrosCandidaturas>): Promise<Paginado<Candidatura>> {
  const { data } = await api.get<Paginado<Candidatura>>("/candidaturas", { params: filtros });
  return data;
}
