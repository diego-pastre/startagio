import { Suspense, type ReactNode } from "react";
import { ExigirNivel } from "@/components/auth/exigir-acesso";
import { Carregando } from "@/components/estados";

export default function InstituicaoLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<Carregando />}>
      <ExigirNivel nivel="INSTITUICAO_ENSINO">{children}</ExigirNivel>
    </Suspense>
  );
}
