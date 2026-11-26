import { Suspense, type ReactNode } from "react";
import { ExigirNivel } from "@/components/auth/exigir-acesso";
import { Carregando } from "@/components/estados";

export default function EstudanteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<Carregando />}>
      <ExigirNivel nivel="ESTUDANTE">{children}</ExigirNivel>
    </Suspense>
  );
}
