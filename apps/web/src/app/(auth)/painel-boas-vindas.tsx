import type { CSSProperties } from "react";
import { Cartaz } from "@/components/cartaz";

/**
 * Lado esquerdo do login e do cadastro: a ideia do produto numa frase e o próprio mural.
 * Os cartazes são ilustração (dados fictícios) e ficam escondidos dos leitores de tela.
 * É o único lugar do site com animação automática: os cartazes sendo presos ao abrir a página.
 */
export function PainelBoasVindas() {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex max-w-xl flex-col gap-5">
        <p className="font-heading text-[2.6rem] leading-[0.98] font-extrabold tracking-[-0.03em] text-balance sm:text-[3.6rem]">
          O mural de estágios saiu do corredor.
        </p>
        <p className="max-w-md text-base text-muted-foreground sm:text-lg">
          Vagas abertas, prova online e resultado no mesmo lugar, para estudantes, empresas e a faculdade.
        </p>
      </div>

      <div aria-hidden className="relative hidden h-72 max-w-xl select-none lg:block">
        <CartazDeExemplo
          area="Desenvolvimento de Sistemas"
          titulo="Estágio em Desenvolvimento Web"
          empresa="Tech Vale"
          bolsa="R$ 1.350"
          className="top-4 left-0 w-60"
          giro={-3}
          atraso={150}
        />
        <CartazDeExemplo
          area="Engenharia Civil"
          titulo="Estágio em Obras e Orçamentos"
          empresa="Construtora Horizonte"
          bolsa="R$ 1.200"
          className="top-0 left-64 w-56"
          giro={2.5}
          atraso={300}
        />
        <div
          className="animar-prender absolute bottom-2 left-36 flex w-48 flex-col gap-0.5 bg-destaque px-4 py-3.5 text-[oklch(0.24_0.018_265)] sombra-papel"
          style={{ "--giro": "-1.5deg", "--atraso": "460ms" } as CSSProperties}
        >
          <span className="font-heading text-base font-bold">Prova enviada</span>
          <span className="text-sm">Nota 8,5 de 10, em análise</span>
        </div>
      </div>
    </section>
  );
}

interface CartazDeExemploProps {
  area: string;
  titulo: string;
  empresa: string;
  bolsa: string;
  className: string;
  giro: number;
  atraso: number;
}

function CartazDeExemplo({ area, titulo, empresa, bolsa, className, giro, atraso }: CartazDeExemploProps) {
  return (
    <Cartaz
      corDaFita={area}
      className={`animar-prender absolute flex flex-col gap-2 px-4 pt-6 pb-4 ${className}`}
      style={{ "--giro": `${giro}deg`, "--atraso": `${atraso}ms` } as CSSProperties}
    >
      <span className="text-[0.7rem] text-muted-foreground">{area}</span>
      <span className="font-heading text-lg leading-tight font-bold">{titulo}</span>
      <span className="text-xs font-medium">{empresa}</span>
      <span className="mt-1 font-heading text-xl font-bold">
        <span className="marca-texto">{bolsa}</span>
        <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">por mês</span>
      </span>
    </Cartaz>
  );
}
