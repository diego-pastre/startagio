"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { UsuarioAutenticado } from "@startagio/contracts";
import { inicioDoPerfil } from "@/lib/rotas";
import { cadastrar, entrar, sair } from "./api";

/** Depois de entrar ou cadastrar, vai para a tela inicial do perfil e recarrega os dados do servidor. */
function useIrParaInicio() {
  const router = useRouter();
  return (usuario: UsuarioAutenticado) => {
    router.replace(inicioDoPerfil(usuario));
    router.refresh();
  };
}

export function useLogin() {
  const irParaInicio = useIrParaInicio();
  return useMutation({ mutationFn: entrar, onSuccess: irParaInicio });
}

export function useCadastro() {
  const irParaInicio = useIrParaInicio();
  return useMutation({ mutationFn: cadastrar, onSuccess: irParaInicio });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sair,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
