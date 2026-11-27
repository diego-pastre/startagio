import { CircleCheckBigIcon, ClipboardListIcon, ClockIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { STATUS_APROVACAO_LABEL, type VagaDetalhe } from "@startagio/contracts";
import { Button } from "@/components/ui/button";
import { formatarNota } from "@/utils/candidaturas";
import { inscricoesEncerradas } from "@/utils/vagas";
import { StatusAprovacaoBadge } from "./status-aprovacao-badge";

/**
 * Cartão de ação do estudante na página da vaga (Tela 3 do PDF).
 * Quem já fez a prova vê "Candidatura já enviada — Nota: X (Status: ...)" no lugar do botão.
 */
export function CartaoCandidatura({ vaga }: { vaga: VagaDetalhe }) {
  const candidatura = vaga.minha_candidatura;

  if (candidatura) {
    return (
      <section className="flex flex-col gap-3 rounded-md border border-sucesso/30 bg-sucesso-suave/60 p-5">
        <div className="flex items-center gap-2 text-sucesso-foreground">
          <CircleCheckBigIcon className="size-5" />
          <h2 className="text-base font-bold">Candidatura já enviada</h2>
        </div>
        <p className="text-sm">
          Nota: <strong>{formatarNota(candidatura.nota_obtida)}</strong> (Status:{" "}
          {STATUS_APROVACAO_LABEL[candidatura.status_aprovacao]})
        </p>
        <StatusAprovacaoBadge status={candidatura.status_aprovacao} />
        <Button asChild variant="outline" size="sm" className="self-start bg-card">
          <Link href="/estudante/minhas-candidaturas">Ver minhas candidaturas</Link>
        </Button>
      </section>
    );
  }

  if (vaga.data_limite_inscricao && inscricoesEncerradas(vaga.data_limite_inscricao)) {
    return <Bloqueado titulo="Inscrições encerradas" texto="O prazo desta vaga já terminou." />;
  }

  if (!vaga.questionario) {
    return (
      <Bloqueado titulo="Prova ainda não disponível" texto="A empresa ainda não cadastrou a prova desta vaga." />
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-md border bg-card p-5 sombra-cartao">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Gostou da vaga?</h2>
        <p className="text-sm text-muted-foreground">A candidatura é feita pela prova. Você só pode fazer uma vez.</p>
      </div>
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <ClipboardListIcon className="size-4 text-primary" />
            {vaga.questionario.total_questoes}{" "}
            {vaga.questionario.total_questoes === 1 ? "questão" : "questões"} de múltipla escolha
          </li>
          <li className="flex items-center gap-2">
            <ClockIcon className="size-4 text-primary" />
            Nota mínima recomendada: {formatarNota(vaga.questionario.nota_minima_aprovacao)}
          </li>
        </ul>
        <Button asChild size="lg" className="w-full">
          <Link href={`/estudante/vagas/${vaga.id}/avaliacao`}>Candidatar-se e iniciar teste</Link>
        </Button>
      </div>
    </section>
  );
}

function Bloqueado({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="flex items-start gap-3 rounded-md border bg-muted/60 p-5">
      <LockIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div>
        <h2 className="text-sm font-bold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{texto}</p>
      </div>
    </section>
  );
}
