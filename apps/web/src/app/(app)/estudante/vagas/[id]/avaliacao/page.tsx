import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { ProvaOnline } from "./prova-online";

export const metadata: Metadata = { title: "Prova da vaga" };

// O id vem da URL (useParams), então a prova fica dentro de <Suspense> (regra do Cache Components).
export default function AvaliacaoPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <ProvaOnline />
    </Suspense>
  );
}
