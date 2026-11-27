import { CircleCheckBigIcon, InfoIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import type { Candidatura } from "@startagio/contracts";
import { Cartaz } from "@/components/cartaz";
import { BarraAfinidade, NotaCircular } from "@/components/candidaturas/indicadores";
import { StatusAprovacaoBadge } from "@/components/candidaturas/status-aprovacao-badge";
import { Button } from "@/components/ui/button";
import { formatarNota } from "@/utils/candidaturas";

/** Resultado mostrado logo depois do envio: a folha da prova corrigida, com nota, acertos e afinidade. */
export function ResultadoDaProva({ candidatura }: { candidatura: Candidatura }) {
  const atingiu = candidatura.nota_obtida >= candidatura.nota_minima_aprovacao;
  const notaMinima = formatarNota(candidatura.nota_minima_aprovacao);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Cartaz className="flex flex-col">
        <div className="flex flex-col gap-1.5 px-6 pt-9 pb-5 sm:px-8">
          <h1 className="text-[1.9rem] leading-[1.05] font-bold sm:text-[2.3rem]">Prova enviada</h1>
          <p className="text-muted-foreground">
            Sua candidatura para {candidatura.vaga.titulo}, na {candidatura.vaga.empresa.nome_fantasia}, já está no
            ranking da vaga.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-dashed px-6 py-7 sm:flex-row sm:gap-8 sm:px-8">
          <NotaCircular nota={candidatura.nota_obtida} notaMinima={candidatura.nota_minima_aprovacao} tamanho="lg" />
          <dl className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-muted-foreground">Acertos</dt>
              <dd className="font-semibold">
                {candidatura.acertos} de {candidatura.total_questoes}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-muted-foreground">Situação</dt>
              <dd>
                <StatusAprovacaoBadge status={candidatura.status_aprovacao} />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Afinidade com a vaga</dt>
              <dd>
                <BarraAfinidade afinidade={candidatura.pontuacao_afinidade} />
              </dd>
            </div>
          </dl>
        </div>

        <p
          className={
            atingiu
              ? "flex items-start gap-2 border-t bg-sucesso-suave/60 px-6 py-4 text-sm text-sucesso-foreground sm:px-8"
              : "flex items-start gap-2 border-t bg-aviso-suave px-6 py-4 text-sm text-aviso-foreground sm:px-8"
          }
        >
          {atingiu ? (
            <CircleCheckBigIcon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
          )}
          {atingiu
            ? `Você passou da nota mínima recomendada (${notaMinima}). Agora a empresa analisa o ranking e entra em contato.`
            : `Sua nota ficou abaixo da mínima recomendada (${notaMinima}), mas a empresa analisa todas as candidaturas.`}
        </p>
      </Cartaz>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/estudante/minhas-candidaturas">Ver minhas candidaturas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/estudante/vagas">
            <SearchIcon />
            Procurar outras vagas
          </Link>
        </Button>
      </div>
    </div>
  );
}
