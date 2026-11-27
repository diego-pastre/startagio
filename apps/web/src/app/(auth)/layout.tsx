import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { Logo } from "@/components/logo";
import { inicioDoPerfil } from "@/lib/rotas";
import { getUsuarioAtual } from "@/lib/sessao";
import { PainelBoasVindas } from "./painel-boas-vindas";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <Suspense fallback={null}>
        <SairSeJaLogado />
      </Suspense>
      <PainelBoasVindas />
      <main className="relative flex flex-col items-center justify-center bg-card px-4 py-12 sm:px-10">
        <div className="absolute top-4 right-4">
          <AlternarTema />
        </div>
        <Logo className="mb-8 lg:hidden" />
        {children}
      </main>
    </div>
  );
}

/** Quem já tem sessão válida não precisa ver login nem cadastro. */
async function SairSeJaLogado() {
  const usuario = await getUsuarioAtual();
  if (usuario) redirect(inicioDoPerfil(usuario));
  return null;
}
