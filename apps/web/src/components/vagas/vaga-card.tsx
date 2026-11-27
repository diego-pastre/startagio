import Link from "next/link";
import type { ReactNode } from "react";
import { formatarData, TIPO_MODELO_LABEL, type VagaResumo } from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { Fita } from "@/components/fita";
import { matizDoNome } from "@/utils/avatar";
import { bolsaCompacta, resumirCursos } from "@/utils/vagas";

/**
 * Cartaz da vaga no mural (Tela 3 do PDF): uma folha presa com fita, e a cor da fita sai da área de atuação.
 * O link cobre o cartaz inteiro (after:inset-0), mantendo um único alvo de clique acessível.
 */
export function VagaCard({ vaga, href }: { vaga: VagaResumo; href: string }) {
  const { visiveis, restantes } = resumirCursos(vaga.cursos);
  const bolsa = bolsaCompacta(vaga.valor_bolsa);

  return (
    <article className="group relative flex h-full flex-col gap-5 rounded-[3px] border bg-card px-5 pt-7 pb-4 sombra-papel transition-colors has-[a:focus-visible]:border-ring hover:border-foreground/25">
      {/* Cada fita entra com um ângulo próprio (estável por vaga), para não parecer carimbada. */}
      <Fita cor={vaga.area_atuacao} giro={(matizDoNome(vaga.titulo) % 7) - 3} />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">{vaga.area_atuacao}</p>
        <h3 className="text-[1.35rem] leading-[1.12] font-bold text-balance">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:content-['']">
            {vaga.titulo}
          </Link>
        </h3>
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <AvatarNome
            nome={vaga.empresa.nome_fantasia}
            forma="quadrado"
            tamanho="sm"
            className="size-6 rounded-[3px] text-[0.6rem]"
          />
          <span className="truncate font-medium">{vaga.empresa.nome_fantasia}</span>
          <span className="shrink-0 text-muted-foreground">
            {vaga.empresa.cidade}/{vaga.empresa.estado}
          </span>
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <p className="flex items-baseline gap-1.5">
          {bolsa ? (
            <>
              <span className="font-heading text-[1.75rem] leading-none font-bold">
                <span className="marca-texto">{bolsa}</span>
              </span>
              <span className="text-sm text-muted-foreground">por mês</span>
            </>
          ) : (
            <span className="font-heading text-lg font-semibold text-muted-foreground">Sem bolsa</span>
          )}
        </p>

        <ul className="flex flex-wrap gap-1.5 text-xs font-medium">
          <Etiqueta>{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Etiqueta>
          <Etiqueta>{vaga.carga_horaria_semanal}h por semana</Etiqueta>
          {vaga.auxilio_transporte && <Etiqueta>Auxílio-transporte</Etiqueta>}
          {vaga.quantidade_posicoes > 1 && <Etiqueta>{vaga.quantidade_posicoes} vagas</Etiqueta>}
        </ul>

        {visiveis.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Para {visiveis.map((curso) => curso.nome_curso).join(", ")}
            {restantes > 0 && ` e mais ${restantes}`}
          </p>
        )}
      </div>

      <footer className="-mx-5 border-t border-dashed px-5 pt-3 text-xs text-muted-foreground">
        {vaga.data_limite_inscricao ? `Inscrições até ${formatarData(vaga.data_limite_inscricao)}` : "Sem data limite"}
      </footer>
    </article>
  );
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <li className="rounded-[3px] border px-2 py-0.5 text-muted-foreground">{children}</li>;
}
