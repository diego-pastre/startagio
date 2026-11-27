"use client";

import { BellRingIcon, FileCheck2Icon, SearchIcon, SearchXIcon, SlidersHorizontalIcon, SparklesIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { filtrosVagasSchema, TIPO_MODELO_LABEL } from "@startagio/contracts";
import { CartaoDicas } from "@/components/layout/cartao-dicas";
import { CartaoPerfil } from "@/components/layout/cartao-perfil";
import { GradeRede } from "@/components/layout/grade-rede";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
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
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((card) => (
          <Skeleton key={card} className="h-60 w-full rounded-2xl" />
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
      <Empty className="rounded-2xl border bg-card sombra-cartao">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-marca-suave text-marca-suave-foreground">
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
      <div className={cn("flex flex-col gap-4 transition-opacity", isPlaceholderData && "opacity-60")}>
        {data.dados.map((vaga) => (
          <VagaCard key={vaga.id} vaga={vaga} href={`/estudante/vagas/${vaga.id}`} />
        ))}
      </div>
    );
  }

  return (
    <GradeRede
      esquerda={
        <>
          <CartaoPerfil />
          <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sombra-cartao">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontalIcon className="size-4 text-primary" />
              Filtros
            </h2>
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
              <Button variant="ghost" size="sm" className="self-start text-primary" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            )}
          </section>
        </>
      }
      direita={
        <CartaoDicas
          titulo="Dicas para se destacar"
          dicas={[
            {
              icone: SparklesIcon,
              titulo: "Mire nas vagas do seu curso",
              texto: "Use o filtro de curso: a afinidade com o perfil pesa no ranking.",
            },
            {
              icone: FileCheck2Icon,
              titulo: "Leia o perfil desejado",
              texto: "Os requisitos obrigatórios aparecem nos detalhes de cada vaga.",
            },
            {
              icone: BellRingIcon,
              titulo: "Fique de olho no prazo",
              texto: "Vaga com data limite sai do mural no dia seguinte.",
            },
          ]}
        />
      }
    >
      <section className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
        <div className="relative flex flex-col gap-4 bg-gradiente-marca px-5 py-6 text-white sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Encontre seu estágio</h1>
              <p className="text-sm text-white/80">Vagas abertas de empresas que querem ensinar e contratar.</p>
            </div>
            {data && (
              <p className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
                {data.total === 1 ? "1 vaga encontrada" : `${data.total} vagas encontradas`}
              </p>
            )}
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar vagas</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="busca"
              type="search"
              placeholder="Cargo, área ou empresa"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              className="h-12 w-full rounded-full border-0 bg-card pr-4 pl-12 text-base text-foreground shadow-lg shadow-black/10 outline-none placeholder:text-muted-foreground focus:ring-4 focus:ring-white/40"
            />
          </label>
        </div>
      </section>

      {conteudo}
      {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={irParaPagina} />}
    </GradeRede>
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
      <FieldLabel htmlFor={id} className="text-xs text-muted-foreground">
        {rotulo}
      </FieldLabel>
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
