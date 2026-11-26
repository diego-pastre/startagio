import type { Metadata } from "next";
import { NovaVagaAssistente } from "./nova-vaga-assistente";

export const metadata: Metadata = { title: "Nova vaga" };

export default function NovaVagaPage() {
  return <NovaVagaAssistente />;
}
