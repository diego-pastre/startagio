import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo PROVISÓRIA: a marca oficial ainda não foi definida.
 * Quando chegar, troque só o <MarcaSimbolo> (por um <svg> ou <Image>); o resto do site usa este componente.
 */
export function Logo({
  className,
  compacto = false,
  claro = false,
}: {
  className?: string;
  /** No celular mostra só o símbolo, para sobrar espaço no topo. */
  compacto?: boolean;
  /** Versão para fundo colorido (painel do login). */
  claro?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Startagio"
      className={cn("flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight", className)}
    >
      <MarcaSimbolo claro={claro} />
      <span className={cn(compacto && "hidden sm:inline", claro ? "text-white" : "text-foreground")}>
        Start<span className={claro ? "text-white/75" : "text-marca"}>agio</span>
      </span>
    </Link>
  );
}

/** Símbolo: um "S" que sobe, como uma carreira começando. */
function MarcaSimbolo({ claro }: { claro: boolean }) {
  return (
    <span
      className={cn(
        "relative flex size-9 items-center justify-center rounded-xl text-white shadow-sm",
        claro ? "bg-white/15 ring-1 ring-white/30 backdrop-blur" : "bg-gradiente-marca",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
        <path
          d="M16.5 6.5c-1-1.2-2.6-1.9-4.4-1.9-2.6 0-4.4 1.4-4.4 3.4 0 4.6 9 2.6 9 7.4 0 2.1-1.9 3.6-4.6 3.6-2 0-3.8-.8-4.9-2.2"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="18.4" cy="4.6" r="1.7" fill="currentColor" className="text-destaque" />
      </svg>
    </span>
  );
}
