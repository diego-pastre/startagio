import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/estados";
import { RankingDeCandidatos } from "./ranking-de-candidatos";

export const metadata: Metadata = { title: "Candidatos" };

// O id vem da URL (useParams), então o ranking fica dentro de <Suspense> (regra do Cache Components).
export default function CandidatosPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <RankingDeCandidatos />
    </Suspense>
  );
}
