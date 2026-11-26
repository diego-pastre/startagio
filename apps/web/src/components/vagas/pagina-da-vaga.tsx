"use client";

import { SearchXIcon } from "lucide-react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import type { VagaDetalhe } from "@startagio/contracts";
import { Carregando } from "@/components/estados";
import { LinkVoltar } from "@/components/link-voltar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useVaga } from "@/domains/vagas/hooks";
import { mensagemDeErro, statusDoErro } from "@/lib/api";

interface PaginaDaVagaProps {
  voltar: { href: string; rotulo: string };
  children: (vaga: VagaDetalhe) => ReactNode;
}

/** Carrega a vaga do :id da URL e cuida dos estados de carregando, não encontrada e erro. */
export function PaginaDaVaga({ voltar, children }: PaginaDaVagaProps) {
  const id = Number(useParams<{ id: string }>().id);
  const idValido = Number.isInteger(id) && id > 0;
  const { data: vaga, isPending, isError, error, refetch } = useVaga(id);

  let conteudo: ReactNode;
  if (!idValido || statusDoErro(error) === 404) {
    conteudo = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Vaga não encontrada</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  } else if (isPending) {
    conteudo = <Carregando />;
  } else if (isError) {
    conteudo = (
      <Alert variant="destructive">
        <AlertTitle>{mensagemDeErro(error)}</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </AlertDescription>
      </Alert>
    );
  } else {
    conteudo = children(vaga);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <LinkVoltar href={voltar.href} rotulo={voltar.rotulo} />
      {conteudo}
    </div>
  );
}
