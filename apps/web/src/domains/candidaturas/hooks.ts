"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FiltrosCandidatos, FiltrosCandidaturas } from "@startagio/contracts";
import { chavesVagas } from "@/domains/vagas/hooks";
import { alterarStatusCandidatura, buscarProva, listarCandidatos, listarMinhasCandidaturas, responderProva } from "./api";

export const chavesCandidaturas = {
  todas: ["candidaturas"] as const,
  minhas: (filtros: Partial<FiltrosCandidaturas>) => ["candidaturas", "minhas", filtros] as const,
  prova: (vagaId: number) => ["candidaturas", "prova", vagaId] as const,
  ranking: (vagaId: number) => ["candidaturas", "ranking", vagaId] as const,
  rankingFiltrado: (vagaId: number, filtros: Partial<FiltrosCandidatos>) =>
    ["candidaturas", "ranking", vagaId, filtros] as const,
};

/** Ranking da vaga para a empresa (Tela 4 do PDF). */
export function useCandidatos(vagaId: number, filtros: Partial<FiltrosCandidatos>) {
  return useQuery({
    queryKey: chavesCandidaturas.rankingFiltrado(vagaId, filtros),
    queryFn: () => listarCandidatos(vagaId, filtros),
    enabled: Number.isInteger(vagaId) && vagaId > 0,
    placeholderData: keepPreviousData,
  });
}

/** Aprovar ou reprovar muda as abas e as contagens: recarrega o ranking daquela vaga. */
export function useAlterarStatusCandidatura(vagaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alterarStatusCandidatura,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chavesCandidaturas.ranking(vagaId) }),
  });
}

export function useProva(vagaId: number) {
  return useQuery({
    queryKey: chavesCandidaturas.prova(vagaId),
    queryFn: () => buscarProva(vagaId),
    enabled: Number.isInteger(vagaId) && vagaId > 0,
    // A prova não muda enquanto a pessoa responde: não buscar de novo ao voltar para a aba.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useMinhasCandidaturas(filtros: Partial<FiltrosCandidaturas>) {
  return useQuery({
    queryKey: chavesCandidaturas.minhas(filtros),
    queryFn: () => listarMinhasCandidaturas(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Depois de enviar, a lista de candidaturas e o detalhe da vaga (botão "Candidatar-se") mudam. */
export function useResponderProva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: responderProva,
    onSuccess: (candidatura) => {
      queryClient.removeQueries({ queryKey: chavesCandidaturas.prova(candidatura.vaga.id) });
      void queryClient.invalidateQueries({ queryKey: chavesCandidaturas.todas });
      void queryClient.invalidateQueries({ queryKey: chavesVagas.detalhe(candidatura.vaga.id) });
    },
  });
}
