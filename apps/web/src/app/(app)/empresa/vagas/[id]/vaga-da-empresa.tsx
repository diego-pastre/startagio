"use client";

import { AcoesStatusVaga } from "@/components/vagas/acoes-status-vaga";
import { PaginaDaVaga } from "@/components/vagas/pagina-da-vaga";
import { StatusVagaBadge } from "@/components/vagas/status-vaga-badge";
import { VagaDetalhes } from "@/components/vagas/vaga-detalhes";

export function VagaDaEmpresa() {
  return (
    <PaginaDaVaga voltar={{ href: "/empresa/vagas", rotulo: "Minhas vagas" }}>
      {(vaga) => (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Situação</span>
              <StatusVagaBadge status={vaga.status} />
            </div>
            <AcoesStatusVaga vaga={vaga} modo="botoes" />
          </div>
          <VagaDetalhes vaga={vaga} />
        </>
      )}
    </PaginaDaVaga>
  );
}
