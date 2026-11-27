"use client";

import { CheckIcon, MailIcon, PhoneIcon, RotateCcwIcon, SearchXIcon, UsersIcon, XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  formatarCpf,
  formatarDataDoInstante,
  formatarTelefone,
  type CandidatoDaVaga,
  type StatusAprovacao,
} from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { BarraAfinidade } from "@/components/candidaturas/indicadores";
import { StatusAprovacaoBadge } from "@/components/candidaturas/status-aprovacao-badge";
import { Carregando } from "@/components/estados";
import { LinkVoltar } from "@/components/link-voltar";
import { Paginacao } from "@/components/paginacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusVagaBadge } from "@/components/vagas/status-vaga-badge";
import { useAlterarStatusCandidatura, useCandidatos } from "@/domains/candidaturas/hooks";
import { mensagemDeErro, statusDoErro } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatarNota } from "@/utils/candidaturas";

type Aba = StatusAprovacao | "TODOS";

const ABAS: { valor: Aba; rotulo: string; cor: string }[] = [
  { valor: "TODOS", rotulo: "Candidatos", cor: "text-foreground" },
  { valor: "EM_ANALISE", rotulo: "Em análise", cor: "text-primary" },
  { valor: "APROVADO", rotulo: "Aprovados", cor: "text-sucesso-foreground" },
  { valor: "REPROVADO", rotulo: "Reprovados", cor: "text-muted-foreground" },
];

const MENSAGEM: Record<StatusAprovacao, string> = {
  APROVADO: "Candidato aprovado.",
  REPROVADO: "Candidato reprovado.",
  EM_ANALISE: "Candidato voltou para análise.",
};

/** Ranking de candidatos da vaga (Tela 4 do PDF), ordenado por nota, afinidade e data de conclusão. */
export function RankingDeCandidatos() {
  const vagaId = Number(useParams<{ id: string }>().id);
  const [aba, setAba] = useState<Aba>("TODOS");
  const [pagina, setPagina] = useState(1);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useCandidatos(vagaId, {
    status: aba === "TODOS" ? undefined : aba,
    pagina,
  });
  const alterar = useAlterarStatusCandidatura(vagaId);

  function mudarStatus(candidato: CandidatoDaVaga, status: StatusAprovacao) {
    alterar.mutate(
      { id: candidato.id, status },
      {
        onSuccess: () => toast.success(MENSAGEM[status]),
        onError: (erro) => toast.error(mensagemDeErro(erro)),
      },
    );
  }

  const voltar = <LinkVoltar href={`/empresa/vagas/${vagaId}`} rotulo="Voltar para a vaga" />;

  if (isPending) return <Carregando />;
  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        {voltar}
        <Alert variant="destructive">
          <AlertTitle>{statusDoErro(error) === 404 ? "Vaga não encontrada" : mensagemDeErro(error)}</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { vaga, contagem, candidatos, nota_minima_aprovacao: notaMinima } = data;

  return (
    <div className="flex flex-col gap-4">
      {voltar}

      <header className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
        <div className="relative flex flex-wrap items-end justify-between gap-3 bg-gradiente-marca px-5 py-6 text-white sm:px-6">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-wider text-white/75 uppercase">Ranking de candidatos</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{vaga.titulo}</h1>
            <p className="text-sm text-white/85">
              Ordenado por nota, depois afinidade. Nota mínima da prova: {formatarNota(notaMinima)}
            </p>
          </div>
          <StatusVagaBadge status={vaga.status} className="relative ring-1 ring-white/40" />
        </div>

        {/* As contagens também são as abas do filtro. */}
        <div role="tablist" aria-label="Filtrar por situação" className="grid grid-cols-2 divide-x border-b sm:grid-cols-4">
          {ABAS.map((item) => (
            <button
              key={item.valor}
              type="button"
              role="tab"
              aria-selected={aba === item.valor}
              onClick={() => {
                setAba(item.valor);
                setPagina(1);
              }}
              className={cn(
                "relative flex flex-col items-start gap-0.5 px-5 py-4 text-left transition-colors hover:bg-muted/50",
                aba === item.valor && "bg-marca-suave/60 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
              )}
            >
              <span className={cn("text-2xl font-extrabold", item.cor)}>{contagem[item.valor]}</span>
              <span className="text-xs text-muted-foreground">{item.rotulo}</span>
            </button>
          ))}
        </div>

        {candidatos.total === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-marca-suave text-marca-suave-foreground">
                {aba === "TODOS" ? <UsersIcon /> : <SearchXIcon />}
              </EmptyMedia>
              <EmptyTitle>{aba === "TODOS" ? "Ninguém fez a prova ainda" : "Ninguém nesta situação"}</EmptyTitle>
              {aba === "TODOS" && (
                <EmptyDescription>Quando um estudante terminar a prova, ele aparece aqui na posição do ranking.</EmptyDescription>
              )}
            </EmptyHeader>
          </Empty>
        ) : (
          <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 pl-5">#</TableHead>
                  <TableHead>Estudante</TableHead>
                  <TableHead className="hidden lg:table-cell">Contato</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                  <TableHead className="hidden w-40 md:table-cell">Afinidade</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="pr-5 text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatos.dados.map((candidato) => (
                  <LinhaDoRanking
                    key={candidato.id}
                    candidato={candidato}
                    notaMinima={notaMinima}
                    ocupado={alterar.isPending && alterar.variables?.id === candidato.id}
                    aoMudar={(status) => mudarStatus(candidato, status)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </header>

      <Paginacao pagina={candidatos.pagina} totalPaginas={candidatos.total_paginas} aoMudar={setPagina} />
    </div>
  );
}

interface LinhaDoRankingProps {
  candidato: CandidatoDaVaga;
  notaMinima: number;
  ocupado: boolean;
  aoMudar: (status: StatusAprovacao) => void;
}

function LinhaDoRanking({ candidato, notaMinima, ocupado, aoMudar }: LinhaDoRankingProps) {
  const { estudante, perfil } = candidato;
  const atingiu = candidato.nota_obtida >= notaMinima;

  return (
    <TableRow>
      <TableCell className="pl-5">
        <Posicao numero={candidato.posicao} />
      </TableCell>
      <TableCell className="max-w-64 whitespace-normal">
        <div className="flex items-center gap-3">
          <AvatarNome nome={estudante.nome_completo} tamanho="sm" />
          <div className="min-w-0">
            <p className="font-semibold">{estudante.nome_completo}</p>
            <p className="text-xs text-muted-foreground">
              {perfil ? `${perfil.curso} · ${perfil.semestre_atual}º semestre` : "Perfil acadêmico não informado"}
            </p>
            <p className="text-xs text-muted-foreground">Prova em {formatarDataDoInstante(candidato.data_conclusao)}</p>
            {/* Em telas menores a coluna de contato some: o e-mail aparece aqui. */}
            <a href={`mailto:${estudante.email}`} className="text-xs text-primary hover:underline lg:hidden">
              {estudante.email}
            </a>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden text-xs lg:table-cell">
        <div className="flex flex-col gap-1 text-muted-foreground">
          <Contato icone={<MailIcon />} href={`mailto:${estudante.email}`}>
            {estudante.email}
          </Contato>
          <Contato icone={<PhoneIcon />} href={`tel:+55${estudante.telefone}`}>
            {formatarTelefone(estudante.telefone)}
          </Contato>
          <span>CPF {formatarCpf(estudante.cpf)}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {/* Verde quando passa da nota mínima, como pede a Tela 4 do PDF. */}
        <span
          className={cn(
            "inline-flex min-w-14 justify-center rounded-full px-2.5 py-1 text-sm font-bold",
            atingiu ? "bg-sucesso-suave text-sucesso-foreground" : "bg-muted text-muted-foreground",
          )}
          title={atingiu ? "Acima da nota mínima" : "Abaixo da nota mínima"}
        >
          {formatarNota(candidato.nota_obtida)}
        </span>
        <p className="mt-1 text-[0.7rem] text-muted-foreground">
          {candidato.acertos}/{candidato.total_questoes} acertos
        </p>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <BarraAfinidade afinidade={candidato.pontuacao_afinidade} />
      </TableCell>
      <TableCell>
        <StatusAprovacaoBadge status={candidato.status_aprovacao} />
      </TableCell>
      <TableCell className="pr-5 text-right">
        <div className="flex justify-end gap-1.5">
          {candidato.status_aprovacao === "EM_ANALISE" ? (
            <>
              <Button
                size="sm"
                className="bg-sucesso text-white hover:bg-sucesso/85"
                disabled={ocupado}
                onClick={() => aoMudar("APROVADO")}
              >
                <CheckIcon />
                Aprovar
              </Button>
              <Button size="sm" variant="outline" disabled={ocupado} onClick={() => aoMudar("REPROVADO")}>
                <XIcon />
                Reprovar
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => aoMudar("EM_ANALISE")}>
              <RotateCcwIcon />
              Desfazer
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

/** Pódio: os três primeiros ganham destaque. */
function Posicao({ numero }: { numero: number }) {
  const podio = ["bg-destaque text-white", "bg-muted-foreground/70 text-white", "bg-[oklch(0.62_0.1_55)] text-white"];
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-sm font-bold",
        podio[numero - 1] ?? "bg-muted text-muted-foreground",
      )}
    >
      {numero}
    </span>
  );
}

function Contato({ icone, href, children }: { icone: ReactNode; href: string; children: ReactNode }) {
  return (
    <a href={href} className="flex items-center gap-1.5 hover:text-primary [&_svg]:size-3.5">
      {icone}
      {children}
    </a>
  );
}
