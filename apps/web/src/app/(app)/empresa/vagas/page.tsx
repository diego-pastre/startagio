import type { Metadata } from "next";
import { MinhasVagas } from "./minhas-vagas";

export const metadata: Metadata = { title: "Minhas vagas" };

export default function VagasEmpresaPage() {
  return <MinhasVagas />;
}
