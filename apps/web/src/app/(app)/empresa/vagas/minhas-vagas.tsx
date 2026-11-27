"use client";

import {
  BriefcaseBusinessIcon,
  CalendarClockIcon,
  ListChecksIcon,
  MegaphoneIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatarData, TIPO_MODELO_LABEL, type StatusVaga } from "@startagio/contracts";
import { CartaoDicas } from "@/components/layout/cartao-dicas";
import { CartaoPerfil } from "@/components/layout/cartao-perfil";
import { GradeRede } from "@/components/layout/grade-rede";
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
      <div className="flex flex-col gap-3 p-5">
        {[1, 2, 3].map((linha) => (
          <Skeleton key={linha} className="h-16 w-full rounded-xl" />
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
            <span className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-marca-suave text-marca-suave-foreground sm:flex">
              <BriefcaseBusinessIcon className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={`/empresa/vagas/${vaga.id}`}
                className="line-clamp-2 font-semibold underline-offset-4 hover:text-primary hover:underline"
              >
                {vaga.titulo}
              </Link>
              <p className="text-xs text-muted-foreground">
                {vaga.area_atuacao} · {TIPO_MODELO_LABEL[vaga.tipo_modelo]} · {textoDaBolsa(vaga.valor_bolsa)}
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
    <GradeRede
      esquerda={<CartaoPerfil />}
      direita={
        <CartaoDicas
          titulo="Atraia bons candidatos"
          dicas={[
            {
              icone: SparklesIcon,
              titulo: "Título claro vende a vaga",
              texto: "\"Estágio em Desenvolvimento Web\" funciona melhor que \"Estagiário TI\".",
            },
            {
              icone: ListChecksIcon,
              titulo: "Separe obrigatório de desejável",
              texto: "Requisitos demais afastam quem está começando.",
            },
            {
              icone: MegaphoneIcon,
              titulo: "Rascunho antes de publicar",
              texto: "Salve, revise com calma e publique quando estiver pronta.",
            },
          ]}
        />
      }
    >
      <section className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Minhas vagas</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} ${data.total === 1 ? "vaga" : "vagas"} nesta lista` : "Gerencie suas publicações"}
            </p>
          </div>
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
          className="mt-4"
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

      {data && <Paginacao pagina={data.pagina} totalPaginas={data.total_paginas} aoMudar={setPagina} />}
    </GradeRede>
  );
}
