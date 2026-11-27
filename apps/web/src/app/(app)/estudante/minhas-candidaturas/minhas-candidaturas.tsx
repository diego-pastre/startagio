"use client";

import { CalendarCheckIcon, SearchIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  formatarDataDoInstante,
  STATUS_VAGA_LABEL,
  type Candidatura,
  type StatusAprovacao,
} from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { BarraAfinidade, NotaCircular } from "@/components/candidaturas/indicadores";
import { StatusAprovacaoBadge } from "@/components/candidaturas/status-aprovacao-badge";
import { AvisoPerfilPendente } from "@/components/layout/aviso-perfil-pendente";
import { CabecalhoDaPagina } from "@/components/layout/cabecalho-pagina";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMinhasCandidaturas } from "@/domains/candidaturas/hooks";
import { mensagemDeErro } from "@/lib/api";
import { cn } from "@/lib/utils";

type Aba = StatusAprovacao | "TODAS";

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: "TODAS", rotulo: "Todas" },
  { valor: "EM_ANALISE", rotulo: "Em análise" },
  { valor: "APROVADO", rotulo: "Aprovadas" },
  { valor: "REPROVADO", rotulo: "Reprovadas" },
];

/** Histórico das provas feitas, com nota, afinidade e status (seção 4.1 do PDF). */
export function MinhasCandidaturas() {
  const [aba, setAba] = useState<Aba>("TODAS");
  const [pagina, setPagina] = useState(1);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useMinhasCandidaturas({
    status: aba === "TODAS" ? undefined : aba,
    pagina,
  });

  let conteudo;
  if (isPending) {
    conteudo = (
      <div className="flex flex-col gap-3 p-5">
        {[1, 2, 3].map((linha) => (
          <Skeleton key={linha} className="h-28 w-full rounded-md" />
        ))}
      </div>
    );
  } else if (isError) {
    conteudo = (
      <div className="p-5">
        <Alert variant="destructive">
          <AlertTitle>{mensagemDeErro(error)}</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  } else if (data.total === 0) {
    conteudo = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-marca-suave text-marca-suave-foreground">
            <SendIcon />
          </EmptyMedia>
          <EmptyTitle>{aba === "TODAS" ? "Você ainda não se candidatou" : "Nenhuma candidatura nesta situação"}</EmptyTitle>
          {aba === "TODAS" && (
            <EmptyDescription>Escolha uma vaga no mural e faça a prova para se candidatar.</EmptyDescription>
          )}
        </EmptyHeader>
        {aba === "TODAS" && (
          <EmptyContent>
            <Button asChild>
              <Link href="/estudante/vagas">
                <SearchIcon />
                Explorar vagas
              </Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  } else {
    conteudo = (
      <ul className={cn("flex flex-col divide-y transition-opacity", isPlaceholderData && "opacity-60")}>
        {data.dados.map((candidatura) => (
          <LinhaCandidatura key={candidatura.id} candidatura={candidatura} />
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDaPagina
        titulo="Minhas candidaturas"
        descricao={
          data
            ? `${data.total} ${data.total === 1 ? "candidatura" : "candidaturas"} nesta lista`
            : "Suas provas e resultados"
        }
        acoes={
          <Button asChild variant="outline">
            <Link href="/estudante/vagas">
              <SearchIcon />
              Ver o mural
            </Link>
          </Button>
        }
      />

      <AvisoPerfilPendente />

      <section className="overflow-hidden rounded-md border bg-card sombra-cartao">
        <Tabs
          value={aba}
          onValueChange={(valor) => {
            setAba(valor as Aba);
            setPagina(1);
          }}
        >
          <div className="max-w-full overflow-x-auto border-b px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList variant="line" className="h-11!">
              {ABAS.map((item) => (
                <TabsTrigger
                  key={item.valor}
                  value={item.valor}
                  className="px-3 data-active:text-primary after:bg-primary! after:bottom-[-4px]!"
                >
                  {item.rotulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {conteudo}
      </section>

      {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={setPagina} />}
    </div>
  );
}

function LinhaCandidatura({ candidatura }: { candidatura: Candidatura }) {
  const { vaga } = candidatura;
  // Vaga pausada ou encerrada sai do mural e não abre mais para o estudante: o título fica sem link.
  const vagaAberta = vaga.status === "ABERTA";

  return (
    <li className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
      <NotaCircular nota={candidatura.nota_obtida} notaMinima={candidatura.nota_minima_aprovacao} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {vagaAberta ? (
            <Link
              href={`/estudante/vagas/${vaga.id}`}
              className="font-heading text-lg leading-tight font-bold underline-offset-4 hover:text-primary hover:underline"
            >
              {vaga.titulo}
            </Link>
          ) : (
            <span className="font-heading text-lg leading-tight font-bold">{vaga.titulo}</span>
          )}
          {!vagaAberta && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
              Vaga {STATUS_VAGA_LABEL[vaga.status].toLowerCase()}
            </span>
          )}
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <AvatarNome nome={vaga.empresa.nome_fantasia} forma="quadrado" tamanho="sm" className="size-5 rounded-md text-[0.55rem]" />
          <span className="font-medium text-foreground">{vaga.empresa.nome_fantasia}</span>
          {vaga.empresa.cidade}/{vaga.empresa.estado}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarCheckIcon className="size-3.5" />
            Prova feita em {formatarDataDoInstante(candidatura.data_conclusao)}
          </span>
          <span>
            {candidatura.acertos} de {candidatura.total_questoes} acertos
          </span>
        </p>
        <BarraAfinidade afinidade={candidatura.pontuacao_afinidade} className="mt-1 max-w-xs" />
      </div>

      <StatusAprovacaoBadge status={candidatura.status_aprovacao} className="self-start sm:self-center" />
    </li>
  );
}
