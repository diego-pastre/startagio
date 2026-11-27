import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { PerfilEstudanteTela } from "./perfil-estudante";

export const metadata: Metadata = { title: "Meu perfil" };

// O ?voltar= vem da URL (useSearchParams), então a tela fica dentro de <Suspense> (regra do Cache Components).
export default function PerfilEstudantePage() {
  return (
    <Suspense fallback={<Carregando />}>
      <PerfilEstudanteTela />
    </Suspense>
  );
}
