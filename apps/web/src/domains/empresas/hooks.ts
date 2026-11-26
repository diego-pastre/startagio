"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EmpresaData } from "@startagio/contracts";
import { atualizarEmpresa, buscarMinhaEmpresa, criarEmpresa } from "./api";

export const chavesEmpresa = {
  minha: ["empresas", "me"] as const,
};

export function useMinhaEmpresa() {
  return useQuery({ queryKey: chavesEmpresa.minha, queryFn: buscarMinhaEmpresa });
}

/** Cria a ficha na primeira vez e atualiza nas seguintes. */
export function useSalvarEmpresa(jaCadastrada: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EmpresaData) => (jaCadastrada ? atualizarEmpresa(dados) : criarEmpresa(dados)),
    onSuccess: (empresa) => queryClient.setQueryData(chavesEmpresa.minha, empresa),
  });
}
