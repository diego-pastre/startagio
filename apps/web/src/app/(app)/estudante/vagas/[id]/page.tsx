import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { VagaParaEstudante } from "./vaga-para-estudante";

export const metadata: Metadata = { title: "Vaga" };

// O id vem da URL (useParams), então o componente fica dentro de <Suspense> (regra do Cache Components).
export default function VagaEstudantePage() {
  return (
    <Suspense fallback={<Carregando />}>
      <VagaParaEstudante />
    </Suspense>
  );
}
