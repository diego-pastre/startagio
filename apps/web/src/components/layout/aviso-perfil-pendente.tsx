"use client";

import { PencilLineIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMeuPerfil } from "@/domains/estudantes/hooks";
import { useUsuarioAtual } from "./usuario-atual";

/**
 * Bilhete no topo da página quando falta cadastro para seguir:
 * estudante sem perfil acadêmico não se candidata; empresa sem ficha não publica vaga.
 */
export function AvisoPerfilPendente() {
  const usuario = useUsuarioAtual();
  const estudante = usuario.nivel_acesso === "ESTUDANTE";
  const { data: perfilAcademico, isSuccess } = useMeuPerfil(estudante);

  const pendente = estudante ? isSuccess && !perfilAcademico : usuario.nivel_acesso === "EMPRESA" && !usuario.empresa;
  if (!pendente) return null;

  const aviso = estudante
    ? { texto: "Para se candidatar, informe seu curso, semestre e idioma.", href: "/estudante/perfil", acao: "Completar perfil" }
    : { texto: "Complete os dados da empresa para publicar vagas.", href: "/empresa/perfil", acao: "Completar dados" };

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-aviso/50 bg-aviso-suave px-4 py-3 text-sm text-aviso-foreground"
    >
      <p className="flex items-center gap-2 font-medium">
        <PencilLineIcon className="size-4 shrink-0" />
        {aviso.texto}
      </p>
      <Button asChild size="sm" variant="outline" className="border-aviso/60 bg-card text-foreground">
        <Link href={aviso.href}>{aviso.acao}</Link>
      </Button>
    </div>
  );
}
