import { Suspense, type ReactNode } from "react";
import { Carregando } from "@/components/estados";
import { Cabecalho } from "@/components/layout/cabecalho";
import { UsuarioAtualProvider } from "@/components/layout/usuario-atual";
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
    <UsuarioAtualProvider usuario={usuario}>
      <Cabecalho usuario={usuario} />
      {/* pb-24 no celular: espaço para a barra de navegação fixa embaixo. */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-24 md:pb-10">{children}</main>
    </UsuarioAtualProvider>
  );
}
