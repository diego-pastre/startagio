import type { Metadata } from "next";
import { MinhasCandidaturas } from "./minhas-candidaturas";

export const metadata: Metadata = { title: "Minhas candidaturas" };

export default function MinhasCandidaturasPage() {
  return <MinhasCandidaturas />;
}
