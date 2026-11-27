"use client";

import { SearchXIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { filtrosVagasSchema, TIPO_MODELO_LABEL } from "@startagio/contracts";
import { CampoDeBusca, FiltroSelecao } from "@/components/filtros";
import { AvisoPerfilPendente } from "@/components/layout/aviso-perfil-pendente";
import { CabecalhoDaPagina } from "@/components/layout/cabecalho-pagina";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { VagaCard } from "@/components/vagas/vaga-card";
import { useMuralDeVagas, useOpcoesFiltroVagas } from "@/domains/vagas/hooks";
import { mensagemDeErro } from "@/lib/api";
import { atualizarFiltrosNaUrl as atualizarUrl } from "@/lib/filtros-na-url";
import { cn } from "@/lib/utils";
import { opcoesDe } from "@/utils/vagas";

export function MuralDeVagas() {
  const parametros = useSearchParams();
  const filtros = filtrosVagasSchema.parse(Object.fromEntries(parametros.entries()));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useMuralDeVagas(filtros);
  const opcoes = useOpcoesFiltroVagas().data;
  const [busca, setBusca] = useState(filtros.busca ?? "");

  // A busca do topo da página muda a URL por fora: o campo daqui acompanha.
  const [buscaDaUrl, setBuscaDaUrl] = useState(filtros.busca);
  if (filtros.busca !== buscaDaUrl) {
    setBuscaDaUrl(filtros.busca);
    if ((busca.trim() || undefined) !== filtros.busca) setBusca(filtros.busca ?? "");
  }

  // A busca vai para a URL 400 ms depois que a pessoa para de digitar.
  useEffect(() => {
    const termo = busca.trim() || undefined;
    if (termo === filtros.busca) return;
    const temporizador = setTimeout(() => atualizarUrl({ busca: termo }), 400);
    return () => clearTimeout(temporizador);
  }, [busca, filtros.busca]);

  const temFiltro = Boolean(filtros.busca || filtros.area || filtros.modalidade || filtros.curso);

  function limparFiltros() {
    setBusca("");
    atualizarUrl({ busca: undefined, area: undefined, modalidade: undefined, curso: undefined });
  }

  function irParaPagina(pagina: number) {
    atualizarUrl({}, pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  let conteudo;
  if (isPending) {
    conteudo = (
      <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((cartaz) => (
          <Skeleton key={cartaz} className="h-72 w-full rounded-[3px]" />
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
      <Empty className="rounded-md border border-dashed bg-card/60">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>{temFiltro ? "Nenhuma vaga com estes filtros" : "O mural está vazio por enquanto"}</EmptyTitle>
        </EmptyHeader>
        {temFiltro && (
          <EmptyContent>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  } else {
    conteudo = (
      <div
        className={cn(
          "grid gap-x-5 gap-y-9 pt-2 transition-opacity sm:grid-cols-2 xl:grid-cols-3",
          isPlaceholderData && "opacity-60",
        )}
      >
        {data.dados.map((vaga) => (
          <VagaCard key={vaga.id} vaga={vaga} href={`/estudante/vagas/${vaga.id}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDaPagina
        titulo="Mural de estágios"
        descricao={
          data ? (data.total === 1 ? "1 vaga aberta" : `${data.total} vagas abertas`) : "Vagas abertas para estudantes"
        }
      />

      <AvisoPerfilPendente />

      <div role="search" className="flex flex-wrap items-center gap-2">
        <CampoDeBusca
          id="busca"
          rotulo="Buscar vagas"
          placeholder="Cargo, área ou empresa"
          valor={busca}
          aoMudar={setBusca}
        />
        <FiltroSelecao
          rotulo="Área de atuação"
          todas="Todas as áreas"
          valor={filtros.area}
          opcoes={(opcoes?.areas ?? []).map((area) => ({ valor: area, rotulo: area }))}
          aoMudar={(area) => atualizarUrl({ area })}
        />
        <FiltroSelecao
          rotulo="Modalidade"
          todas="Todas as modalidades"
          valor={filtros.modalidade}
          opcoes={opcoesDe(TIPO_MODELO_LABEL)}
          aoMudar={(modalidade) => atualizarUrl({ modalidade })}
        />
        <FiltroSelecao
          rotulo="Curso"
          todas="Todos os cursos"
          valor={filtros.curso}
          opcoes={(opcoes?.cursos ?? []).map((curso) => ({ valor: curso, rotulo: curso }))}
          aoMudar={(curso) => atualizarUrl({ curso })}
        />
        {temFiltro && (
          <Button variant="ghost" className="text-primary" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        )}
      </div>

      {conteudo}
      {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={irParaPagina} />}
    </div>
  );
}
