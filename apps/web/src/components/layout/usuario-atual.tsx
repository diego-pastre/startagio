"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UsuarioAutenticado } from "@startagio/contracts";

// O layout da área logada já busca o usuário no servidor (GET /api/auth/me).
// Este contexto entrega esse mesmo usuário aos componentes de cliente (cartão de perfil, menu)
// sem uma segunda chamada à API.

const UsuarioAtualContext = createContext<UsuarioAutenticado | null>(null);

export function UsuarioAtualProvider({ usuario, children }: { usuario: UsuarioAutenticado; children: ReactNode }) {
  return <UsuarioAtualContext value={usuario}>{children}</UsuarioAtualContext>;
}

export function useUsuarioAtual(): UsuarioAutenticado {
  const usuario = useContext(UsuarioAtualContext);
  if (!usuario) throw new Error("useUsuarioAtual precisa estar dentro da área logada.");
  return usuario;
}
