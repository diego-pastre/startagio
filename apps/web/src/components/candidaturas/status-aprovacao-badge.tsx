import { STATUS_APROVACAO_LABEL, type StatusAprovacao } from "@startagio/contracts";
import { cn } from "@/lib/utils";

// Mesmo carimbo do selo de situação da vaga, com as cores do resultado: caneta azul, verde e caneta vermelha.
const ESTILO: Record<StatusAprovacao, string> = {
  EM_ANALISE: "border-marca/60 text-marca-suave-foreground",
  APROVADO: "border-sucesso/70 text-sucesso-foreground",
  REPROVADO: "border-destructive/60 text-destructive",
};

export function StatusAprovacaoBadge({ status, className }: { status: StatusAprovacao; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-[3px] border-[1.5px] px-2 text-xs font-semibold whitespace-nowrap",
        ESTILO[status],
        className,
      )}
    >
      {STATUS_APROVACAO_LABEL[status]}
    </span>
  );
}
