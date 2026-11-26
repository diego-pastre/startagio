import { STATUS_VAGA_LABEL, type StatusVaga } from "@startagio/contracts";
import { Badge } from "@/components/ui/badge";

const VARIANTE: Record<StatusVaga, "default" | "secondary" | "outline"> = {
  ABERTA: "default",
  RASCUNHO: "secondary",
  PAUSADA: "outline",
  ENCERRADA: "outline",
};

export function StatusVagaBadge({ status }: { status: StatusVaga }) {
  return (
    <Badge variant={VARIANTE[status]} className={status === "ENCERRADA" ? "text-muted-foreground" : undefined}>
      {STATUS_VAGA_LABEL[status]}
    </Badge>
  );
}
