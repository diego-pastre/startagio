import type { Metadata } from "next";
import { AssistenteVaga } from "./assistente-vaga";

export const metadata: Metadata = { title: "Nova vaga" };

export default function NovaVagaPage() {
  return <AssistenteVaga modo={{ tipo: "criar" }} />;
}
