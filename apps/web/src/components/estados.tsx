import { HammerIcon, type LucideIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function Carregando() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-primary">
      <Spinner className="size-7" aria-label="Carregando" />
    </div>
  );
}

/** Tela de uma etapa que ainda não foi construída (roadmap em docs/arquitetura.md). */
export function EmBreve({
  titulo,
  etapa,
  descricao,
  icone: Icone = HammerIcon,
}: {
  titulo: string;
  etapa: string;
  descricao?: string;
  icone?: LucideIcon;
}) {
  return (
    <section className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center sombra-cartao">
      <span className="relative flex size-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-marca-suave" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-primary/10" />
        <Icone className="relative size-8 text-primary" />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-xl font-bold">{titulo}</h1>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      <span className="rounded-full bg-aviso-suave px-3 py-1 text-xs font-semibold text-aviso-foreground">
        Em construção · {etapa}
      </span>
    </section>
  );
}
