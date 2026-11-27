"use client";

import { SearchIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TODAS = "__todas";

interface CampoDeBuscaProps {
  id: string;
  rotulo: string;
  placeholder: string;
  valor: string;
  aoMudar: (valor: string) => void;
}

/** Campo de busca da barra de filtros: o rótulo fica só para leitores de tela, a lupa já diz o que é. */
export function CampoDeBusca({ id, rotulo, placeholder, valor, aoMudar }: CampoDeBuscaProps) {
  return (
    <label className="relative min-w-56 flex-1">
      <span className="sr-only">{rotulo}</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="h-10 w-full rounded-md border bg-card pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30"
      />
    </label>
  );
}

interface FiltroSelecaoProps {
  rotulo: string;
  todas: string;
  valor: string | undefined;
  opcoes: { valor: string; rotulo: string }[];
  aoMudar: (valor: string | undefined) => void;
}

/** Filtro em linha: o valor escolhido aparece no próprio botão, por isso não precisa de rótulo visível. */
export function FiltroSelecao({ rotulo, todas, valor, opcoes, aoMudar }: FiltroSelecaoProps) {
  return (
    <Select value={valor ?? TODAS} onValueChange={(novo) => aoMudar(novo === TODAS ? undefined : novo)}>
      <SelectTrigger
        aria-label={rotulo}
        className={cn("h-10! w-full bg-card sm:w-auto sm:min-w-44", valor && "border-foreground/40 font-medium")}
      >
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
  );
}
