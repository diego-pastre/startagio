"use client";

import { ClipboardListIcon, PencilIcon, TriangleAlertIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import type { VagaDetalhe } from "@startagio/contracts";
import { Button } from "@/components/ui/button";
import { AcoesStatusVaga } from "@/components/vagas/acoes-status-vaga";
import { PaginaDaVaga } from "@/components/vagas/pagina-da-vaga";
import { StatusVagaBadge } from "@/components/vagas/status-vaga-badge";
import { VagaDetalhes } from "@/components/vagas/vaga-detalhes";
import { formatarNota } from "@/utils/candidaturas";

export function VagaDaEmpresa() {
  return (
    <PaginaDaVaga voltar={{ href: "/empresa/vagas", rotulo: "Minhas vagas" }}>
      {(vaga) => (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-3 sombra-cartao">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Situação da vaga</span>
              <StatusVagaBadge status={vaga.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/empresa/vagas/${vaga.id}/candidatos`}>
                  <UsersIcon />
                  Candidatos ({vaga.total_candidaturas})
                </Link>
              </Button>
              {vaga.status !== "ENCERRADA" && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/empresa/vagas/${vaga.id}/editar`}>
                    <PencilIcon />
                    Editar
                  </Link>
                </Button>
              )}
              <AcoesStatusVaga vaga={vaga} modo="botoes" />
            </div>
          </div>
          <VagaDetalhes vaga={vaga} acao={<ResumoDaProva questionario={vaga.questionario} />} />
        </>
      )}
    </PaginaDaVaga>
  );
}

function ResumoDaProva({ questionario }: { questionario: VagaDetalhe["questionario"] }) {
  if (!questionario) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-aviso/40 bg-aviso-suave p-5 text-aviso-foreground">
        <TriangleAlertIcon className="mt-0.5 size-5 shrink-0" />
        <div className="text-sm">
          <h2 className="font-bold">Vaga sem prova</h2>
          <p>Criada antes da prova ser obrigatória: não recebe candidaturas. Use “Editar” para criar a prova.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-5 sombra-cartao">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-marca-suave text-marca-suave-foreground">
          <ClipboardListIcon className="size-4" />
        </span>
        <h2 className="text-base font-bold">Prova da vaga</h2>
      </div>
      <p className="text-sm font-medium">{questionario.titulo}</p>
      <p className="text-sm text-muted-foreground">
        {questionario.total_questoes} {questionario.total_questoes === 1 ? "questão" : "questões"} · nota mínima{" "}
        {formatarNota(questionario.nota_minima_aprovacao)}
      </p>
    </section>
  );
}
