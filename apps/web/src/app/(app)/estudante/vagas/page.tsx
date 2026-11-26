import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { MuralDeVagas } from "./mural-de-vagas";

export const metadata: Metadata = { title: "Vagas" };

// Os filtros vêm da URL (useSearchParams), então o mural fica dentro de <Suspense> (regra do Cache Components).
export default function VagasEstudantePage() {
  return (
    <Suspense fallback={<Carregando />}>
      <MuralDeVagas />
    </Suspense>
  );
}
