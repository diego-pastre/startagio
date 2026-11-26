"use client";

import { SearchXIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { filtrosVagasSchema, TIPO_MODELO_LABEL } from "@startagio/contracts";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { VagaCard } from "@/components/vagas/vaga-card";
import { useMuralDeVagas, useOpcoesFiltroVagas } from "@/domains/vagas/hooks";
import { mensagemDeErro } from "@/lib/api";
import { cn } from "@/lib/utils";
import { opcoesDe } from "@/utils/vagas";

type ChaveDeFiltro = "busca" | "area" | "modalidade" | "curso";

/**
 * Os filtros ficam na URL (?area=...&pagina=2): recarregar ou compartilhar o link mantém a busca.
 * O replaceState muda a URL sem ir ao servidor, e o Next atualiza o useSearchParams.
 */
function atualizarUrl(mudancas: Partial<Record<ChaveDeFiltro, string | undefined>>, pagina?: number) {
  const parametros = new URLSearchParams(window.location.search);
  for (const [chave, valor] of Object.entries(mudancas)) {
    if (valor) parametros.set(chave, valor);
    else parametros.delete(chave);
  }
  if (pagina && pagina > 1) parametros.set("pagina", String(pagina));
  else parametros.delete("pagina");
  const consulta = parametros.toString();
  window.history.replaceState(null, "", consulta ? `?${consulta}` : window.location.pathname);
}

const TODAS = "__todas";

export function MuralDeVagas() {
  const parametros = useSearchParams();
  const filtros = filtrosVagasSchema.parse(Object.fromEntries(parametros.entries()));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useMuralDeVagas(filtros);
  const opcoes = useOpcoesFiltroVagas().data;
  const [busca, setBusca] = useState(filtros.busca ?? "");

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
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((card) => (
          <Skeleton key={card} className="h-52 w-full rounded-xl" />
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
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>{temFiltro ? "Nenhuma vaga com estes filtros" : "Nenhuma vaga aberta no momento"}</EmptyTitle>
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
      <div className={cn("grid gap-4 transition-opacity sm:grid-cols-2", isPlaceholderData && "opacity-60")}>
        {data.dados.map((vaga) => (
          <VagaCard key={vaga.id} vaga={vaga} href={`/estudante/vagas/${vaga.id}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Vagas de estágio</h1>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total === 1 ? "1 vaga encontrada" : `${data.total} vagas encontradas`}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="busca">Buscar</FieldLabel>
            <Input
              id="busca"
              type="search"
              placeholder="Cargo, área ou empresa"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </Field>
          <FiltroSelecao
            id="area"
            rotulo="Área de atuação"
            todas="Todas as áreas"
            valor={filtros.area}
            opcoes={(opcoes?.areas ?? []).map((area) => ({ valor: area, rotulo: area }))}
            aoMudar={(area) => atualizarUrl({ area })}
          />
          <FiltroSelecao
            id="modalidade"
            rotulo="Modalidade"
            todas="Todas as modalidades"
            valor={filtros.modalidade}
            opcoes={opcoesDe(TIPO_MODELO_LABEL)}
            aoMudar={(modalidade) => atualizarUrl({ modalidade })}
          />
          <FiltroSelecao
            id="curso"
            rotulo="Curso"
            todas="Todos os cursos"
            valor={filtros.curso}
            opcoes={(opcoes?.cursos ?? []).map((curso) => ({ valor: curso, rotulo: curso }))}
            aoMudar={(curso) => atualizarUrl({ curso })}
          />
          {temFiltro && (
            <Button variant="ghost" className="self-start" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          )}
        </aside>

        <section className="flex flex-col gap-4">
          {conteudo}
          {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={irParaPagina} />}
        </section>
      </div>
    </div>
  );
}

interface FiltroSelecaoProps {
  id: string;
  rotulo: string;
  todas: string;
  valor: string | undefined;
  opcoes: { valor: string; rotulo: string }[];
  aoMudar: (valor: string | undefined) => void;
}

function FiltroSelecao({ id, rotulo, todas, valor, opcoes, aoMudar }: FiltroSelecaoProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <Select value={valor ?? TODAS} onValueChange={(novo) => aoMudar(novo === TODAS ? undefined : novo)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>{todas}</SelectItem>
          {opcoes.map((opcao) => (
            <SelectItem key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
