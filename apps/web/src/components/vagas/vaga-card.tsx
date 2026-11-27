import { ArrowRightIcon, BusIcon, ClockIcon, GraduationCapIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatarData, formatarDataDoInstante, TIPO_MODELO_LABEL, type VagaResumo } from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { resumirCursos, textoDaBolsa } from "@/utils/vagas";

/** Card do mural (Tela 3 do PDF), no formato de publicação de rede social: empresa no topo, vaga no corpo. */
export function VagaCard({ vaga, href }: { vaga: VagaResumo; href: string }) {
  const { visiveis, restantes } = resumirCursos(vaga.cursos);

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 sombra-cartao transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:sombra-cartao-forte">
      <header className="flex items-center gap-3">
        <AvatarNome nome={vaga.empresa.nome_fantasia} forma="quadrado" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{vaga.empresa.nome_fantasia}</p>
          <p className="truncate text-xs text-muted-foreground">
            {vaga.empresa.cidade}/{vaga.empresa.estado} · Publicada em {formatarDataDoInstante(vaga.criado_em)}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg leading-snug font-bold tracking-tight transition-colors group-hover:text-primary">
          {/* O link cobre o card inteiro (after:inset-0), mantendo um único alvo de clique acessível. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {vaga.titulo}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{vaga.area_atuacao}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sucesso-suave px-3 py-1 text-sm font-bold text-sucesso-foreground">
          {textoDaBolsa(vaga.valor_bolsa)}
        </span>
        <Chip icone={<MapPinIcon />}>{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Chip>
        <Chip icone={<ClockIcon />}>{vaga.carga_horaria_semanal}h/semana</Chip>
        {vaga.auxilio_transporte && <Chip icone={<BusIcon />}>Auxílio-transporte</Chip>}
        {vaga.quantidade_posicoes > 1 && <Chip icone={<UsersIcon />}>{vaga.quantidade_posicoes} vagas</Chip>}
      </div>

      {visiveis.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <GraduationCapIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {visiveis.map((curso) => curso.nome_curso).join(" · ")}
            {restantes > 0 && <span className="font-medium text-foreground"> +{restantes}</span>}
          </span>
        </p>
      )}

      <footer className="flex items-center justify-between gap-3 border-t pt-3 text-xs">
        <span className="text-muted-foreground">
          {vaga.data_limite_inscricao ? `Inscrições até ${formatarData(vaga.data_limite_inscricao)}` : "Sem data limite"}
        </span>
        <span className="flex items-center gap-1 font-semibold text-primary">
          Ver vaga
          <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </footer>
    </article>
  );
}

function Chip({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground [&_svg]:size-3.5">
      {icone}
      {children}
    </span>
  );
}
