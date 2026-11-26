import type { Metadata } from "next";
import { EmBreve } from "@/components/estados";

export const metadata: Metadata = { title: "Minhas candidaturas" };

export default function MinhasCandidaturasPage() {
  return <EmBreve titulo="Minhas candidaturas" etapa="fase 3, motor de avaliação" />;
}
