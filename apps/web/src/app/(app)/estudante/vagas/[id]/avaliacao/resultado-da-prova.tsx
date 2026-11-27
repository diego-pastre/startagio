import { ArrowRightIcon, CircleCheckBigIcon, PartyPopperIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import type { Candidatura } from "@startagio/contracts";
import { BarraAfinidade, NotaCircular } from "@/components/candidaturas/indicadores";
import { StatusAprovacaoBadge } from "@/components/candidaturas/status-aprovacao-badge";
import { Button } from "@/components/ui/button";
import { formatarNota } from "@/utils/candidaturas";

/** Resultado mostrado logo depois do envio: nota, acertos, afinidade e o próximo passo. */
export function ResultadoDaProva({ candidatura }: { candidatura: Candidatura }) {
  const atingiu = candidatura.nota_obtida >= candidatura.nota_minima_aprovacao;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
        <div className="relative flex flex-col items-center gap-2 bg-gradiente-marca px-6 py-8 text-center text-white">
          <div aria-hidden className="pointer-events-none absolute -top-20 -left-10 size-56 rounded-full bg-white/10 blur-2xl" />
          <span className="relative flex size-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            <PartyPopperIcon className="size-7" />
          </span>
          <h1 className="relative text-2xl font-extrabold tracking-tight">Candidatura enviada!</h1>
          <p className="relative text-sm text-white/85">
            {candidatura.vaga.titulo} · {candidatura.vaga.empresa.nome_fantasia}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:items-center sm:gap-8">
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
              ? "flex items-start gap-2 border-t bg-sucesso-suave/60 px-6 py-4 text-sm text-sucesso-foreground"
              : "flex items-start gap-2 border-t bg-aviso-suave px-6 py-4 text-sm text-aviso-foreground"
          }
        >
          <CircleCheckBigIcon className="mt-0.5 size-4 shrink-0" />
          {atingiu
            ? `Você passou da nota mínima recomendada (${formatarNota(candidatura.nota_minima_aprovacao)}). Agora a empresa analisa o ranking e entra em contato.`
            : `Sua nota ficou abaixo da mínima recomendada (${formatarNota(candidatura.nota_minima_aprovacao)}), mas a empresa analisa todas as candidaturas.`}
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/estudante/minhas-candidaturas">
            Ver minhas candidaturas
            <ArrowRightIcon />
          </Link>
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
