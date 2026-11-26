import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { VagaDaEmpresa } from "./vaga-da-empresa";

export const metadata: Metadata = { title: "Vaga" };

// O id vem da URL (useParams), então o componente fica dentro de <Suspense> (regra do Cache Components).
export default function VagaDaEmpresaPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <VagaDaEmpresa />
    </Suspense>
  );
}
