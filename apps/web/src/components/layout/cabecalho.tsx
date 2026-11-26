"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NIVEL_ACESSO_LABEL, type UsuarioAutenticado } from "@startagio/contracts";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { AlternarTema } from "./alternar-tema";
import { menuDoUsuario } from "./menu";

/** "Ana Souza (demo)" → "AS": só conta as palavras que começam com letra. */
function iniciais(nome: string): string {
  const partes = nome.split(/\s+/).filter((parte) => /^\p{L}/u.test(parte));
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

export function Cabecalho({ usuario }: { usuario: UsuarioAutenticado }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:gap-6">
        <Logo compacto />

        {/* No celular o menu rola de lado sem mostrar a barra de rolagem. */}
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuDoUsuario(usuario).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname.startsWith(item.href) && "bg-muted font-medium text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <AlternarTema />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu da conta">
                <Avatar className="size-8">
                  <AvatarFallback>{iniciais(usuario.nome_completo)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate">{usuario.empresa?.nome_fantasia ?? usuario.nome_completo}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {NIVEL_ACESSO_LABEL[usuario.nivel_acesso]} · {usuario.usuario}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={logout.isPending} onSelect={() => logout.mutate()}>
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
