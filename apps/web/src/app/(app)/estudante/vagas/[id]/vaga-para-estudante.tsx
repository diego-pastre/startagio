"use client";

import { CartaoCandidatura } from "@/components/candidaturas/cartao-candidatura";
import { PaginaDaVaga } from "@/components/vagas/pagina-da-vaga";
import { VagaDetalhes } from "@/components/vagas/vaga-detalhes";

export function VagaParaEstudante() {
  return (
    <PaginaDaVaga voltar={{ href: "/estudante/vagas", rotulo: "Vagas" }}>
      {(vaga) => <VagaDetalhes vaga={vaga} acao={<CartaoCandidatura vaga={vaga} />} />}
    </PaginaDaVaga>
  );
}
