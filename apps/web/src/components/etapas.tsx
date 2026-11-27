import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EtapasProps {
  titulos: readonly string[];
  atual: number;
  /** Só as etapas já concluídas podem ser clicadas (para voltar), a não ser com `todasLiberadas`. */
  aoSelecionar: (indice: number) => void;
  /** Na edição tudo já está preenchido: qualquer etapa pode ser aberta. */
  todasLiberadas?: boolean;
}

/** Indicador de etapas do assistente (Stepper da Tela 2 do PDF). */
export function Etapas({ titulos, atual, aoSelecionar, todasLiberadas = false }: EtapasProps) {
  return (
    <div className="flex flex-col gap-2">
      <ol className="flex items-center gap-2">
        {titulos.map((titulo, indice) => {
          const concluida = indice < atual;
          const ativa = indice === atual;
          return (
            <li key={titulo} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                disabled={ativa || !(concluida || todasLiberadas)}
                onClick={() => aoSelecionar(indice)}
                aria-current={ativa ? "step" : undefined}
                className="flex items-center gap-2 text-sm disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] font-heading text-sm font-bold text-muted-foreground transition-colors",
                    ativa && "border-foreground bg-foreground text-background",
                    concluida && "border-primary/60 text-primary",
                  )}
                >
                  {concluida ? <CheckIcon className="size-4" /> : indice + 1}
                </span>
                <span className={cn("hidden whitespace-nowrap sm:inline", ativa ? "font-semibold" : "text-muted-foreground")}>
                  <span className={cn(ativa && "marca-texto")}>{titulo}</span>
                </span>
              </button>
              {indice < titulos.length - 1 && (
                <span
                  className={cn("h-0 flex-1 border-t-[1.5px] border-dashed transition-colors", concluida && "border-solid border-primary/60")}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted-foreground sm:hidden">
        Etapa {atual + 1} de {titulos.length}: <span className="font-medium text-foreground">{titulos[atual]}</span>
      </p>
    </div>
  );
}
