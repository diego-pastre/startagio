import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { inicioDoPerfil } from "@/lib/rotas";
import { getUsuarioAtual } from "@/lib/sessao";

export default function Inicio() {
  return (
    <Suspense fallback={<Carregando />}>
      <RedirecionarConformeSessao />
    </Suspense>
  );
}

async function RedirecionarConformeSessao(): Promise<never> {
  const usuario = await getUsuarioAtual();
  redirect(usuario ? inicioDoPerfil(usuario) : "/login");
}
