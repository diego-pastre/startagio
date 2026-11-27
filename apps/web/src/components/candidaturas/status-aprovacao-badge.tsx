import { STATUS_APROVACAO_LABEL, type StatusAprovacao } from "@startagio/contracts";
import { cn } from "@/lib/utils";

// Mesmo formato do selo de situação da vaga, com as cores do resultado.
const ESTILO: Record<StatusAprovacao, string> = {
  EM_ANALISE: "bg-marca-suave text-marca-suave-foreground before:bg-marca",
  APROVADO: "bg-sucesso-suave text-sucesso-foreground before:bg-sucesso",
  REPROVADO: "bg-muted text-muted-foreground before:bg-muted-foreground/60",
};

export function StatusAprovacaoBadge({ status, className }: { status: StatusAprovacao; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        "before:size-1.5 before:rounded-full before:content-['']",
        ESTILO[status],
        className,
      )}
    >
      {STATUS_APROVACAO_LABEL[status]}
    </span>
  );
}
