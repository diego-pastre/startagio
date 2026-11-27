"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buscarMeuPerfil, salvarMeuPerfil } from "./api";

export const chavesEstudante = {
  perfil: ["estudantes", "perfil"] as const,
};

/** `enabled: false` para quem não é estudante (o cartão de perfil é o mesmo para todos). */
export function useMeuPerfil(enabled = true) {
  return useQuery({ queryKey: chavesEstudante.perfil, queryFn: buscarMeuPerfil, enabled, staleTime: 5 * 60_000 });
}

export function useSalvarPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salvarMeuPerfil,
    onSuccess: (perfil) => queryClient.setQueryData(chavesEstudante.perfil, perfil),
  });
}
