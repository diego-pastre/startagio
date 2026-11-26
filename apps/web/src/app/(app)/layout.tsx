import { Suspense, type ReactNode } from "react";
import { Carregando } from "@/components/estados";
import { Cabecalho } from "@/components/layout/cabecalho";
import { exigirUsuario } from "@/lib/sessao";

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<Carregando />}>
      <AreaLogada>{children}</AreaLogada>
    </Suspense>
  );
}

async function AreaLogada({ children }: { children: ReactNode }) {
  const usuario = await exigirUsuario();

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">{children}</main>
    </>
  );
}
