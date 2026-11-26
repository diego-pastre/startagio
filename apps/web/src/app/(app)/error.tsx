"use client";

import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// No Next 16.4 o error boundary recebe retry(), que busca de novo o conteúdo no servidor.
export default function ErroDaArea({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Não foi possível carregar esta página</EmptyTitle>
        <EmptyDescription>Confira se a API está rodando e tente de novo.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => retry()}>Tentar de novo</Button>
      </EmptyContent>
    </Empty>
  );
}
