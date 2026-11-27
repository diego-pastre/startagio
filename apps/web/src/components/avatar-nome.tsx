import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { iniciais, matizDoNome } from "@/utils/avatar";

const TAMANHOS = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

interface AvatarNomeProps {
  nome: string;
  tamanho?: keyof typeof TAMANHOS;
  /** Pessoa usa círculo; empresa usa quadrado arredondado, como logo. */
  forma?: "circulo" | "quadrado";
  className?: string;
}

/** Avatar com as iniciais sobre uma cor que sai do nome (enquanto não há foto nem logo). */
export function AvatarNome({ nome, tamanho = "md", forma = "circulo", className }: AvatarNomeProps) {
  return (
    <span
      aria-hidden
      style={{ "--matiz": matizDoNome(nome) } as CSSProperties}
      className={cn(
        "flex shrink-0 items-center justify-center font-bold tracking-tight select-none",
        "bg-[oklch(0.92_0.06_var(--matiz))] text-[oklch(0.38_0.13_var(--matiz))]",
        "dark:bg-[oklch(0.36_0.08_var(--matiz))] dark:text-[oklch(0.92_0.06_var(--matiz))]",
        forma === "circulo" ? "rounded-full" : "rounded-xl",
        TAMANHOS[tamanho],
        className,
      )}
    >
      {iniciais(nome) || "?"}
    </span>
  );
}
