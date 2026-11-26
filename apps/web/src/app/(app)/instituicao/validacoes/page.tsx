import type { Metadata } from "next";
import { EmBreve } from "@/components/estados";

export const metadata: Metadata = { title: "Validações" };

export default function ValidacoesPage() {
  return <EmBreve titulo="Validações de estágio" etapa="fase 4, seleção e homologação" />;
}
