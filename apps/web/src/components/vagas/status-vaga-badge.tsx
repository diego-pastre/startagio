import { STATUS_VAGA_LABEL, type StatusVaga } from "@startagio/contracts";
import { cn } from "@/lib/utils";

// Cada situação com a própria cor, para bater o olho na lista e saber o que está no ar.
const ESTILO: Record<StatusVaga, string> = {
  ABERTA: "bg-sucesso-suave text-sucesso-foreground before:bg-sucesso",
  RASCUNHO: "bg-aviso-suave text-aviso-foreground before:bg-aviso",
  PAUSADA: "bg-marca-suave text-marca-suave-foreground before:bg-marca",
  ENCERRADA: "bg-muted text-muted-foreground before:bg-muted-foreground/60",
};

export function StatusVagaBadge({ status, className }: { status: StatusVaga; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        "before:size-1.5 before:rounded-full before:content-['']",
        ESTILO[status],
        className,
      )}
    >
      {STATUS_VAGA_LABEL[status]}
    </span>
  );
}
