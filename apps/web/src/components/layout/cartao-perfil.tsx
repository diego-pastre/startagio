"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NIVEL_ACESSO_LABEL } from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { useMeuPerfil } from "@/domains/estudantes/hooks";
import { cn } from "@/lib/utils";
import { menuDoUsuario } from "./menu";
import { useUsuarioAtual } from "./usuario-atual";

/** Cartão da coluna esquerda: capa, avatar, nome, perfil e atalhos. Some abaixo de 1024px, como no LinkedIn. */
export function CartaoPerfil({ className }: { className?: string }) {
  const usuario = useUsuarioAtual();
  const pathname = usePathname();
  const empresaPendente = usuario.nivel_acesso === "EMPRESA" && !usuario.empresa;
  const estudante = usuario.nivel_acesso === "ESTUDANTE";
  const { data: perfilAcademico, isSuccess } = useMeuPerfil(estudante);
  const perfilPendente = estudante && isSuccess && !perfilAcademico;

  return (
    <section
      aria-label="Seu perfil"
      className={cn("hidden flex-col overflow-hidden rounded-2xl border bg-card sombra-cartao lg:flex", className)}
    >
      <div className="h-16 bg-gradiente-marca" />
      <div className="-mt-9 flex flex-col items-center px-4 pb-4 text-center">
        <AvatarNome
          nome={usuario.nome_completo}
          tamanho="xl"
          className="size-18 text-xl ring-4 ring-card"
        />
        <p className="mt-2 font-heading text-base leading-tight font-bold">{usuario.nome_completo}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {usuario.empresa ? `${usuario.empresa.nome_fantasia} · ` : ""}
          {NIVEL_ACESSO_LABEL[usuario.nivel_acesso]}
        </p>
        {perfilAcademico && (
          <p className="mt-1 text-xs font-medium">
            {perfilAcademico.curso} · {perfilAcademico.semestre_atual}º semestre
          </p>
        )}
        <p className="text-xs text-muted-foreground">@{usuario.usuario}</p>
      </div>

      {perfilPendente && (
        <Link
          href="/estudante/perfil"
          className="mx-3 mb-3 flex items-center justify-between gap-2 rounded-xl bg-aviso-suave px-3 py-2 text-xs font-medium text-aviso-foreground transition-opacity hover:opacity-85"
        >
          Complete seu perfil acadêmico para se candidatar
          <ArrowRightIcon className="size-3.5 shrink-0" />
        </Link>
      )}

      {empresaPendente && (
        <Link
          href="/empresa/perfil"
          className="mx-3 mb-3 flex items-center justify-between gap-2 rounded-xl bg-aviso-suave px-3 py-2 text-xs font-medium text-aviso-foreground transition-opacity hover:opacity-85"
        >
          Complete o perfil da empresa para publicar vagas
          <ArrowRightIcon className="size-3.5 shrink-0" />
        </Link>
      )}

      <nav aria-label="Atalhos" className="flex flex-col border-t p-2">
        {menuDoUsuario(usuario).map((item) => {
          const Icone = item.icone;
          const ativo = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                ativo && "bg-marca-suave font-semibold text-marca-suave-foreground hover:bg-marca-suave",
              )}
            >
              <Icone className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
