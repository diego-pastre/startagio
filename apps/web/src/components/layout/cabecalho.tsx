"use client";

import { ChevronDownIcon, LogOutIcon, MoonIcon, SearchIcon, SunIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, type FormEvent } from "react";
import { NIVEL_ACESSO_LABEL, type UsuarioAutenticado } from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/domains/auth/hooks";
import { cn } from "@/lib/utils";
import { menuDoUsuario, type ItemMenu } from "./menu";

/**
 * Barra do topo da área logada: só palavras, e a página atual riscada de marca-texto.
 * No celular o menu vai para uma barra fixa embaixo, como num app.
 */
export function Cabecalho({ usuario }: { usuario: UsuarioAutenticado }) {
  const pathname = usePathname();
  const itens = menuDoUsuario(usuario);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
          <Logo compacto />

          <nav aria-label="Menu principal" className="ml-4 hidden items-center gap-1 md:flex">
            {itens.map((item) => (
              <ItemDoTopo key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {usuario.permissoes.pode_candidatar && <BuscaRapida />}
            <MenuDaConta usuario={usuario} />
          </div>
        </div>
      </header>

      <nav
        aria-label="Menu principal"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {itens.map((item) => (
          <ItemDeBaixo key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}
      </nav>
    </>
  );
}

function ItemDoTopo({ item, ativo }: { item: ItemMenu; ativo: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        ativo && "text-foreground",
      )}
    >
      <span className={cn(ativo && "marca-texto")}>{item.curto}</span>
    </Link>
  );
}

function ItemDeBaixo({ item, ativo }: { item: ItemMenu; ativo: boolean }) {
  const Icone = item.icone;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2 text-[0.72rem] text-muted-foreground",
        ativo && "font-semibold text-foreground",
      )}
    >
      <Icone className={cn("size-5", ativo && "text-primary")} strokeWidth={ativo ? 2.3 : 1.8} />
      <span className={cn(ativo && "marca-texto")}>{item.curto}</span>
    </Link>
  );
}

/** Busca do topo: leva para o mural já filtrado. */
function BuscaRapida() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  function buscar(evento: FormEvent) {
    evento.preventDefault();
    const busca = termo.trim();
    router.push(busca ? `/estudante/vagas?busca=${encodeURIComponent(busca)}` : "/estudante/vagas");
    setTermo("");
  }

  return (
    <form role="search" onSubmit={buscar} className="relative hidden w-64 lg:block">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        aria-label="Buscar vagas"
        placeholder="Buscar vagas"
        value={termo}
        onChange={(evento) => setTermo(evento.target.value)}
        className="h-9 w-full rounded-md border bg-card pr-3 pl-8.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30"
      />
    </form>
  );
}

function MenuDaConta({ usuario }: { usuario: UsuarioAutenticado }) {
  const logout = useLogout();
  const { resolvedTheme, setTheme } = useTheme();
  const nomeExibido = usuario.empresa?.nome_fantasia ?? usuario.nome_completo;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Menu da conta"
      >
        <AvatarNome nome={usuario.nome_completo} tamanho="sm" />
        <ChevronDownIcon className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        <DropdownMenuLabel className="flex items-center gap-3 p-3">
          <AvatarNome nome={usuario.nome_completo} tamanho="md" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{nomeExibido}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {NIVEL_ACESSO_LABEL[usuario.nivel_acesso]}, @{usuario.usuario}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1">
          {usuario.nivel_acesso === "EMPRESA" && (
            <DropdownMenuItem asChild>
              <Link href="/empresa/perfil">
                <UserRoundIcon />
                Perfil da empresa
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
            {resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={() => logout.mutate()}>
            <LogOutIcon />
            Sair
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
