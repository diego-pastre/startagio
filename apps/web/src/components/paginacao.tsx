"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
}

export function Paginacao({ pagina, totalPaginas, aoMudar }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3 text-sm">
      <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => aoMudar(pagina - 1)}>
        <ChevronLeftIcon />
        Anterior
      </Button>
      <span className="text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </span>
      <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => aoMudar(pagina + 1)}>
        Próxima
        <ChevronRightIcon />
      </Button>
    </nav>
  );
}
