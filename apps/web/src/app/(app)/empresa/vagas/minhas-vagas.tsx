"use client";

import { BriefcaseIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatarData, TIPO_MODELO_LABEL, type StatusVaga } from "@startagio/contracts";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcoesStatusVaga } from "@/components/vagas/acoes-status-vaga";
import { StatusVagaBadge } from "@/components/vagas/status-vaga-badge";
import { useMinhasVagas } from "@/domains/vagas/hooks";
import { mensagemDeErro } from "@/lib/api";
import { cn } from "@/lib/utils";
import { textoDaBolsa } from "@/utils/vagas";

type Aba = StatusVaga | "TODAS";

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: "TODAS", rotulo: "Todas" },
  { valor: "ABERTA", rotulo: "Abertas" },
  { valor: "RASCUNHO", rotulo: "Rascunhos" },
  { valor: "PAUSADA", rotulo: "Pausadas" },
  { valor: "ENCERRADA", rotulo: "Encerradas" },
];

export function MinhasVagas() {
  const [aba, setAba] = useState<Aba>("TODAS");
  const [pagina, setPagina] = useState(1);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useMinhasVagas({
    status: aba === "TODAS" ? undefined : aba,
    pagina,
  });

  let conteudo;
  if (isPending) {
    conteudo = (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((linha) => (
          <Skeleton key={linha} className="h-14 w-full" />
        ))}
      </div>
    );
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
  } else if (data.total === 0) {
    conteudo = (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BriefcaseIcon />
          </EmptyMedia>
          <EmptyTitle>{aba === "TODAS" ? "Nenhuma vaga ainda" : "Nenhuma vaga nesta situação"}</EmptyTitle>
        </EmptyHeader>
        {aba === "TODAS" && (
          <EmptyContent>
            <Button asChild>
              <Link href="/empresa/vagas/nova">
                <PlusIcon />
                Criar a primeira vaga
              </Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  } else {
    conteudo = (
      <div className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaga</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="hidden md:table-cell">Modalidade</TableHead>
              <TableHead className="hidden md:table-cell">Bolsa</TableHead>
              <TableHead className="hidden sm:table-cell">Inscrições até</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.dados.map((vaga) => (
              <TableRow key={vaga.id}>
                <TableCell className="max-w-72 whitespace-normal">
                  <Link href={`/empresa/vagas/${vaga.id}`} className="font-medium underline-offset-4 hover:underline">
                    {vaga.titulo}
                  </Link>
                  <div className="text-xs text-muted-foreground">{vaga.area_atuacao}</div>
                </TableCell>
                <TableCell>
                  <StatusVagaBadge status={vaga.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</TableCell>
                <TableCell className="hidden md:table-cell">{textoDaBolsa(vaga.valor_bolsa)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {vaga.data_limite_inscricao ? formatarData(vaga.data_limite_inscricao) : "Sem data limite"}
                </TableCell>
                <TableCell className="text-right">
                  <AcoesStatusVaga vaga={vaga} modo="menu" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas vagas</h1>
        <Button asChild>
          <Link href="/empresa/vagas/nova">
            <PlusIcon />
            Nova vaga
          </Link>
        </Button>
      </div>

      <Tabs
        value={aba}
        onValueChange={(valor) => {
          setAba(valor as Aba);
          setPagina(1);
        }}
      >
        {/* No celular as abas rolam de lado; a barra de rolagem fica escondida, como no menu do topo. */}
        <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList>
            {ABAS.map((item) => (
              <TabsTrigger key={item.valor} value={item.valor}>
                {item.rotulo}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {conteudo}

      {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={setPagina} />}
    </div>
  );
}
