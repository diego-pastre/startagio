import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo PROVISÓRIA: a marca oficial ainda não foi definida.
 * O símbolo é um cartaz preso com fita de marca-texto, o mesmo desenho das vagas no mural.
 * Quando a marca chegar, troque só o <MarcaSimbolo>; o resto do site usa este componente.
 */
export function Logo({
  className,
  compacto = false,
  claro = false,
}: {
  className?: string;
  /** No celular mostra só o símbolo, para sobrar espaço no topo. */
  compacto?: boolean;
  /** Versão para fundo escuro ou colorido. */
  claro?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Startagio"
      className={cn("flex shrink-0 items-center gap-2.5 font-heading text-xl font-extrabold tracking-tight", className)}
    >
      <MarcaSimbolo />
      <span className={cn(compacto && "hidden sm:inline", claro ? "text-white" : "text-foreground")}>Startagio</span>
    </Link>
  );
}

function MarcaSimbolo() {
  return (
    <span className="relative flex size-8.5 items-center justify-center rounded-[3px] border bg-card text-lg leading-none text-primary sombra-papel">
      S
      <span aria-hidden className="absolute -top-1.5 left-1/2 h-2.5 w-6 -translate-x-1/2 -rotate-6 bg-destaque/90" />
    </span>
  );
}
