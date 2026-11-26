"use client";

import { InfoIcon } from "lucide-react";
import { formatarData } from "@startagio/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaginaDaVaga } from "@/components/vagas/pagina-da-vaga";
import { VagaDetalhes } from "@/components/vagas/vaga-detalhes";
import { inscricoesEncerradas } from "@/utils/vagas";

export function VagaParaEstudante() {
  return (
    <PaginaDaVaga voltar={{ href: "/estudante/vagas", rotulo: "Vagas" }}>
      {(vaga) => (
        <>
          {vaga.data_limite_inscricao && inscricoesEncerradas(vaga.data_limite_inscricao) && (
            <Alert>
              <InfoIcon />
              <AlertDescription>As inscrições terminaram em {formatarData(vaga.data_limite_inscricao)}.</AlertDescription>
            </Alert>
          )}
          <VagaDetalhes vaga={vaga} />
        </>
      )}
    </PaginaDaVaga>
  );
}
