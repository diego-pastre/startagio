import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EtapasProps {
  titulos: readonly string[];
  atual: number;
  /** Só as etapas já concluídas podem ser clicadas (para voltar). */
  aoSelecionar: (indice: number) => void;
}

/** Indicador de etapas do assistente (Stepper da Tela 2 do PDF). */
export function Etapas({ titulos, atual, aoSelecionar }: EtapasProps) {
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
                disabled={!concluida}
                onClick={() => aoSelecionar(indice)}
                aria-current={ativa ? "step" : undefined}
                className="flex items-center gap-2 text-sm disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground",
                    ativa && "border-primary bg-primary text-primary-foreground",
                    concluida && "border-primary text-primary",
                  )}
                >
                  {concluida ? <CheckIcon className="size-4" /> : indice + 1}
                </span>
                <span className={cn("hidden whitespace-nowrap sm:inline", ativa ? "font-medium" : "text-muted-foreground")}>
                  {titulo}
                </span>
              </button>
              {indice < titulos.length - 1 && <span className="h-px flex-1 bg-border" />}
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
