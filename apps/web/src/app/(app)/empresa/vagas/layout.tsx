import { Suspense, type ReactNode } from "react";
import { ExigirEmpresaCadastrada } from "@/components/auth/exigir-acesso";
import { Carregando } from "@/components/estados";

export default function VagasEmpresaLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<Carregando />}>
      <ExigirEmpresaCadastrada>{children}</ExigirEmpresaCadastrada>
    </Suspense>
  );
}
