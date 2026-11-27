"use client";

import { BriefcaseBusinessIcon, CalendarClockIcon, PlusIcon, SearchXIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { filtrosMinhasVagasSchema, formatarData, TIPO_MODELO_LABEL, type StatusVaga } from "@startagio/contracts";
import { CampoDeBusca } from "@/components/filtros";
import { AvisoPerfilPendente } from "@/components/layout/aviso-perfil-pendente";
import { CabecalhoDaPagina } from "@/components/layout/cabecalho-pagina";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcoesStatusVaga } from "@/components/vagas/acoes-status-vaga";
import { StatusVagaBadge } from "@/components/vagas/status-vaga-badge";
import { useMinhasVagas } from "@/domains/vagas/hooks";
import { mensagemDeErro } from "@/lib/api";
import { atualizarFiltrosNaUrl } from "@/lib/filtros-na-url";
import { cn } from "@/lib/utils";
import { matizDoNome } from "@/utils/avatar";
import { textoDaBolsa } from "@/utils/vagas";

type Aba = StatusVaga | "TODAS";

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: "TODAS", rotulo: "Todas" },
  { valor: "ABERTA", rotulo: "Abertas" },
  { valor: "RASCUNHO", rotulo: "Rascunhos" },
  { valor: "PAUSADA", rotulo: "Pausadas" },
  { valor: "ENCERRADA", rotulo: "Encerradas" },
];

/**
 * "Minhas vagas" da empresa: a busca, a situação (abas) e a página ficam na URL, como no mural.
 * Recarregar a página ou voltar do detalhe da vaga mantém o que estava filtrado.
 */
export function MinhasVagas() {
  const parametros = useSearchParams();
  const filtros = filtrosMinhasVagasSchema.parse(Object.fromEntries(parametros.entries()));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useMinhasVagas(filtros);
  const [busca, setBusca] = useState(filtros.busca ?? "");
  const aba: Aba = filtros.status ?? "TODAS";

  // A busca vai para a URL 400 ms depois que a pessoa para de digitar.
  useEffect(() => {
    const termo = busca.trim() || undefined;
    if (termo === filtros.busca) return;
    const temporizador = setTimeout(() => atualizarFiltrosNaUrl({ busca: termo }), 400);
    return () => clearTimeout(temporizador);
  }, [busca, filtros.busca]);

  function limparBusca() {
    setBusca("");
    atualizarFiltrosNaUrl({ busca: undefined });
  }

  function irParaPagina(pagina: number) {
    atualizarFiltrosNaUrl({}, pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  let conteudo;
  if (isPending) {
    conteudo = (
      <div className="flex flex-col gap-3 p-5">
        {[1, 2, 3].map((linha) => (
          <Skeleton key={linha} className="h-16 w-full rounded-md" />
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
  } else if (data.total === 0 && filtros.busca) {
    conteudo = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhuma vaga encontrada para “{filtros.busca}”</EmptyTitle>
          <EmptyDescription>A busca procura no título e na área da vaga.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={limparBusca}>
            Limpar busca
          </Button>
        </EmptyContent>
      </Empty>
    );
  } else if (data.total === 0) {
    conteudo = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-marca-suave text-marca-suave-foreground">
            <BriefcaseBusinessIcon />
          </EmptyMedia>
          <EmptyTitle>{aba === "TODAS" ? "Nenhuma vaga ainda" : "Nenhuma vaga nesta situação"}</EmptyTitle>
          {aba === "TODAS" && (
            <EmptyDescription>Publique a primeira vaga e comece a receber candidatos.</EmptyDescription>
          )}
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
      <ul className={cn("flex flex-col divide-y transition-opacity", isPlaceholderData && "opacity-60")}>
        {data.dados.map((vaga) => (
          <li key={vaga.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
            {/* A mesma cor da fita do cartaz no mural, para a empresa reconhecer a vaga. */}
            <span
              aria-hidden
              style={{ "--matiz": matizDoNome(vaga.area_atuacao) } as CSSProperties}
              className="h-11 w-1.5 shrink-0 rounded-full bg-[oklch(var(--fita-luz)_calc(var(--fita-croma)*1.6)_var(--matiz))]"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={`/empresa/vagas/${vaga.id}`}
                className="line-clamp-2 font-heading text-lg leading-tight font-bold underline-offset-4 hover:text-primary hover:underline"
              >
                {vaga.titulo}
              </Link>
              <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span>{vaga.area_atuacao}</span>
                <span>{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</span>
                <span className="font-medium text-foreground">{textoDaBolsa(vaga.valor_bolsa)}</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarClockIcon className="size-3.5" />
                  {vaga.data_limite_inscricao ? `Até ${formatarData(vaga.data_limite_inscricao)}` : "Sem data limite"}
                </span>
                <Link
                  href={`/empresa/vagas/${vaga.id}/candidatos`}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <UsersIcon className="size-3.5" />
                  {vaga.total_candidaturas} {vaga.total_candidaturas === 1 ? "candidato" : "candidatos"}
                </Link>
              </p>
            </div>
            <StatusVagaBadge status={vaga.status} />
            <AcoesStatusVaga vaga={vaga} modo="menu" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDaPagina
        titulo="Minhas vagas"
        descricao={data ? `${data.total} ${data.total === 1 ? "vaga" : "vagas"} nesta lista` : "Suas vagas publicadas"}
        acoes={
          <Button asChild>
            <Link href="/empresa/vagas/nova">
              <PlusIcon />
              Nova vaga
            </Link>
          </Button>
        }
      />

      <AvisoPerfilPendente />

      <div role="search" className="flex">
        <CampoDeBusca
          id="busca-minhas-vagas"
          rotulo="Buscar nas minhas vagas"
          placeholder="Buscar pelo título ou pela área da vaga"
          valor={busca}
          aoMudar={setBusca}
        />
      </div>

      <section className="overflow-hidden rounded-md border bg-card sombra-cartao">
        <Tabs
          value={aba}
          onValueChange={(valor) => atualizarFiltrosNaUrl({ status: valor === "TODAS" ? undefined : valor })}
        >
          {/* No celular as abas rolam de lado; a barra de rolagem fica escondida. */}
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

      {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={irParaPagina} />}
    </div>
  );
}
