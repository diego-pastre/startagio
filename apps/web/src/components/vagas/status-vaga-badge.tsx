import { STATUS_VAGA_LABEL, type StatusVaga } from "@startagio/contracts";
import { cn } from "@/lib/utils";

// Selo em forma de carimbo: contorno e texto da mesma cor. Rascunho tem contorno tracejado (ainda não vale).
const ESTILO: Record<StatusVaga, string> = {
  ABERTA: "border-sucesso/70 text-sucesso-foreground",
  RASCUNHO: "border-dashed border-muted-foreground/60 text-muted-foreground",
  PAUSADA: "border-aviso text-aviso-foreground",
  ENCERRADA: "border-border text-muted-foreground",
};

export function StatusVagaBadge({ status, className }: { status: StatusVaga; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-[3px] border-[1.5px] px-2 text-xs font-semibold whitespace-nowrap",
        ESTILO[status],
        className,
      )}
    >
      {STATUS_VAGA_LABEL[status]}
    </span>
  );
}
