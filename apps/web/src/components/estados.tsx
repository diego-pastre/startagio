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
    <section className="flex flex-col items-center gap-4 rounded-md border border-dashed bg-card px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-marca-suave">
        <Icone className="size-7 text-primary" />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-xl font-bold">{titulo}</h2>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      <span className="rounded-[3px] border-[1.5px] border-dashed border-aviso px-2 py-0.5 text-xs font-semibold text-aviso-foreground">
        Em construção: {etapa}
      </span>
    </section>
  );
}
