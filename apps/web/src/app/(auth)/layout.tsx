import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { Logo } from "@/components/logo";
import { inicioDoPerfil } from "@/lib/rotas";
import { getUsuarioAtual } from "@/lib/sessao";
import { PainelBoasVindas } from "./painel-boas-vindas";

/** Login e cadastro sobre papel quadriculado: o formulário fica preso no mural, ao lado dos cartazes. */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col papel-quadriculado">
      <Suspense fallback={null}>
        <SairSeJaLogado />
      </Suspense>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <AlternarTema />
      </header>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-x-16 gap-y-12 px-5 pt-4 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <PainelBoasVindas />
        <main className="flex justify-center lg:justify-end">{children}</main>
      </div>
    </div>
  );
}

/** Quem já tem sessão válida não precisa ver login nem cadastro. */
async function SairSeJaLogado() {
  const usuario = await getUsuarioAtual();
  if (usuario) redirect(inicioDoPerfil(usuario));
  return null;
}
