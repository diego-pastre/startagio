import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { EditarVaga } from "./editar-vaga";

export const metadata: Metadata = { title: "Editar vaga" };

// O id vem da URL (useParams), então a tela fica dentro de <Suspense> (regra do Cache Components).
export default function EditarVagaPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <EditarVaga />
    </Suspense>
  );
}
