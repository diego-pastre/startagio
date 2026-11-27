import type { LucideIcon } from "lucide-react";

export interface Dica {
  icone: LucideIcon;
  titulo: string;
  texto: string;
}

/** Cartão da coluna da direita, com dicas curtas para quem está naquela tela. */
export function CartaoDicas({ titulo, dicas }: { titulo: string; dicas: Dica[] }) {
  return (
    <>
      <section className="rounded-2xl border bg-card p-4 sombra-cartao">
        <h2 className="text-sm font-bold">{titulo}</h2>
        <ul className="mt-3 flex flex-col gap-3.5">
          {dicas.map(({ icone: Icone, titulo: tituloDaDica, texto }) => (
            <li key={tituloDaDica} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-marca-suave text-marca-suave-foreground">
                <Icone className="size-4" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm leading-snug font-semibold">{tituloDaDica}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="px-2 text-center text-xs text-muted-foreground">
        Startagio · Estudantes, empresas e instituições no mesmo lugar
      </p>
    </>
  );
}
