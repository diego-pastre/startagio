import { NOTA_MAXIMA } from "@startagio/contracts";
import { cn } from "@/lib/utils";
import { faixaDeAfinidade, formatarNota, ROTULO_AFINIDADE, type FaixaDeAfinidade } from "@/utils/candidaturas";

const COR_DA_FAIXA: Record<FaixaDeAfinidade, string> = {
  alta: "bg-sucesso",
  media: "bg-aviso",
  baixa: "bg-muted-foreground/50",
};

/** Anel com a nota de 0 a 10. Verde quando atinge a nota mínima da prova. */
export function NotaCircular({
  nota,
  notaMinima,
  tamanho = "md",
}: {
  nota: number;
  notaMinima: number;
  tamanho?: "md" | "lg";
}) {
  const raio = 42;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (Math.min(nota, NOTA_MAXIMA) / NOTA_MAXIMA) * circunferencia;
  const atingiu = nota >= notaMinima;

  return (
    <div
      role="img"
      aria-label={`Nota ${formatarNota(nota)} de 10`}
      className={cn("relative shrink-0", tamanho === "lg" ? "size-36" : "size-18")}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={raio} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${circunferencia}`}
          className={cn("transition-[stroke-dasharray] duration-700", atingiu ? "stroke-sucesso" : "stroke-aviso")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-heading leading-none font-bold tracking-tight", tamanho === "lg" ? "text-4xl" : "text-base")}>
          {formatarNota(nota)}
        </span>
        {tamanho === "lg" && <span className="mt-1 text-xs text-muted-foreground">de 10</span>}
      </div>
    </div>
  );
}

/** Barra de afinidade (0 a 100) com o rótulo da faixa. */
export function BarraAfinidade({ afinidade, className }: { afinidade: number | null; className?: string }) {
  const faixa = faixaDeAfinidade(afinidade);
  if (afinidade === null || !faixa) {
    return <p className={cn("text-xs text-muted-foreground", className)}>Afinidade não calculada</p>;
  }
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold">{ROTULO_AFINIDADE[faixa]}</span>
        <span className="text-muted-foreground">{Math.round(afinidade)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", COR_DA_FAIXA[faixa])} style={{ width: `${Math.min(afinidade, 100)}%` }} />
      </div>
    </div>
  );
}
