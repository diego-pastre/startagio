import { GraduationCapIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** `compacto`: no celular mostra só o ícone, para sobrar espaço no menu do topo. */
export function Logo({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Startagio"
      className={cn("flex shrink-0 items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCapIcon className="size-5" />
      </span>
      <span className={cn(compacto && "hidden sm:inline")}>Startagio</span>
    </Link>
  );
}
