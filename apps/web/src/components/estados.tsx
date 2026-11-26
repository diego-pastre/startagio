import { ConstructionIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export function Carregando() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-muted-foreground">
      <Spinner className="size-6" aria-label="Carregando" />
    </div>
  );
}

/** Tela de uma etapa que ainda não foi construída (roadmap em docs/arquitetura.md). */
export function EmBreve({ titulo, etapa }: { titulo: string; etapa: string }) {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ConstructionIcon />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        <EmptyDescription>Em construção: {etapa}.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
