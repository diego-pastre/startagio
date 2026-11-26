import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { Logo } from "@/components/logo";
import { inicioDoPerfil } from "@/lib/rotas";
import { getUsuarioAtual } from "@/lib/sessao";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-10">
      <Suspense fallback={null}>
        <SairSeJaLogado />
      </Suspense>
      <div className="absolute top-4 right-4">
        <AlternarTema />
      </div>
      <Logo className="text-lg" />
      {children}
    </main>
  );
}

/** Quem já tem sessão válida não precisa ver login nem cadastro. */
async function SairSeJaLogado() {
  const usuario = await getUsuarioAtual();
  if (usuario) redirect(inicioDoPerfil(usuario));
  return null;
}
