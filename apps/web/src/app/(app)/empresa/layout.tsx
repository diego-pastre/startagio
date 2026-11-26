import { Suspense, type ReactNode } from "react";
import { ExigirNivel } from "@/components/auth/exigir-acesso";
import { Carregando } from "@/components/estados";

export default function EmpresaLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<Carregando />}>
      <ExigirNivel nivel="EMPRESA">{children}</ExigirNivel>
    </Suspense>
  );
}
