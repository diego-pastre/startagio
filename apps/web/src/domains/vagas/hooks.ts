"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FiltrosMinhasVagas, FiltrosVagas, VagaDetalhe } from "@startagio/contracts";
import {
  alterarStatusVaga,
  buscarFormularioVaga,
  buscarOpcoesFiltro,
  buscarVaga,
  criarVaga,
  editarVaga,
  listarMinhasVagas,
  listarVagas,
} from "./api";

export const chavesVagas = {
  todas: ["vagas"] as const,
  mural: (filtros: Partial<FiltrosVagas>) => ["vagas", "mural", filtros] as const,
  opcoesFiltro: ["vagas", "opcoes-filtro"] as const,
  minhas: (filtros: Partial<FiltrosMinhasVagas>) => ["vagas", "minhas", filtros] as const,
  detalhe: (id: number) => ["vagas", "detalhe", id] as const,
  formulario: (id: number) => ["vagas", "formulario", id] as const,
};

/** Mural do estudante. Mantém a lista anterior na tela enquanto carrega a próxima página ou filtro. */
export function useMuralDeVagas(filtros: Partial<FiltrosVagas>) {
  return useQuery({
    queryKey: chavesVagas.mural(filtros),
    queryFn: () => listarVagas(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useOpcoesFiltroVagas() {
  return useQuery({ queryKey: chavesVagas.opcoesFiltro, queryFn: buscarOpcoesFiltro, staleTime: 5 * 60_000 });
}

export function useMinhasVagas(filtros: Partial<FiltrosMinhasVagas>) {
  return useQuery({
    queryKey: chavesVagas.minhas(filtros),
    queryFn: () => listarMinhasVagas(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useVaga(id: number) {
  return useQuery({
    queryKey: chavesVagas.detalhe(id),
    queryFn: () => buscarVaga(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

/** A vaga completa, com gabarito, para a empresa editar. Sempre busca de novo ao abrir a edição. */
export function useFormularioVaga(id: number) {
  return useQuery({
    queryKey: chavesVagas.formulario(id),
    queryFn: () => buscarFormularioVaga(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/** Depois de criar ou mudar o status, guarda o detalhe novo e atualiza as listas. */
function useAtualizarCacheDaVaga() {
  const queryClient = useQueryClient();
  return (vaga: VagaDetalhe) => {
    queryClient.setQueryData(chavesVagas.detalhe(vaga.id), vaga);
    return queryClient.invalidateQueries({
      queryKey: chavesVagas.todas,
      predicate: (query) => query.queryKey[1] !== "detalhe",
    });
  };
}

export function useCriarVaga() {
  const atualizarCache = useAtualizarCacheDaVaga();
  return useMutation({ mutationFn: criarVaga, onSuccess: atualizarCache });
}

export function useEditarVaga() {
  const atualizarCache = useAtualizarCacheDaVaga();
  return useMutation({ mutationFn: editarVaga, onSuccess: atualizarCache });
}

export function useAlterarStatusVaga() {
  const atualizarCache = useAtualizarCacheDaVaga();
  return useMutation({ mutationFn: alterarStatusVaga, onSuccess: atualizarCache });
}
