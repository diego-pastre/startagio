import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { MinhasVagas } from "./minhas-vagas";

export const metadata: Metadata = { title: "Minhas vagas" };

// Os filtros vêm da URL (useSearchParams), então a lista fica dentro de <Suspense> (regra do Cache Components).
export default function VagasEmpresaPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <MinhasVagas />
    </Suspense>
  );
}
