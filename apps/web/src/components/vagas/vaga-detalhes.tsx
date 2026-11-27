import {
  BusIcon,
  CalendarClockIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  NavigationIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  formatarData,
  formatarDataDoInstante,
  GRAU_CURSO_LABEL,
  NIVEL_FORMACAO_LABEL,
  separarLinhas,
  separarTags,
  TIPO_MODELO_LABEL,
  type VagaDetalhe,
} from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { faixaDeSemestres, textoDaBolsa, textoDoIdioma } from "@/utils/vagas";

/**
 * Página de detalhes da vaga: dados da vaga, perfil desejado, cursos e empresa (Tela 3 do PDF).
 * `acao` fica no topo da coluna da direita: a candidatura (estudante) ou o resumo da prova (empresa).
 */
export function VagaDetalhes({ vaga, acao }: { vaga: VagaDetalhe; acao?: ReactNode }) {
  const perfil = vaga.perfil_desejado;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-4">
        <header className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
          <div className="h-24 bg-gradiente-marca" />
          <div className="flex flex-col gap-4 px-5 pb-6 sm:px-6">
            <AvatarNome
              nome={vaga.empresa.nome_fantasia}
              forma="quadrado"
              tamanho="xl"
              className="-mt-10 rounded-2xl ring-4 ring-card"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">{vaga.area_atuacao}</p>
              <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">{vaga.titulo}</h1>
              <p className="text-muted-foreground">
                {vaga.empresa.nome_fantasia} · {vaga.empresa.cidade}/{vaga.empresa.estado}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sucesso-suave px-3 py-1 text-sm font-bold text-sucesso-foreground">
                {textoDaBolsa(vaga.valor_bolsa)}
              </span>
              <Pilula>{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Pilula>
              <Pilula>{vaga.carga_horaria_semanal}h por semana</Pilula>
              {vaga.auxilio_transporte && <Pilula>Auxílio-transporte</Pilula>}
            </div>
          </div>
        </header>

        <Secao titulo="Sobre a vaga">
          <p className="leading-relaxed whitespace-pre-line">{vaga.descricao}</p>
        </Secao>

        {vaga.beneficios && (
          <Secao titulo="Benefícios">
            <p className="leading-relaxed whitespace-pre-line">{vaga.beneficios}</p>
          </Secao>
        )}

        {perfil && (
          <Secao titulo="Perfil desejado">
            <dl className="grid gap-3 sm:grid-cols-3">
              <Destaque rotulo="Formação">{NIVEL_FORMACAO_LABEL[perfil.nivel_formacao]}</Destaque>
              {faixaDeSemestres(perfil.semestre_minimo, perfil.semestre_maximo) && (
                <Destaque rotulo="Período">{faixaDeSemestres(perfil.semestre_minimo, perfil.semestre_maximo)}</Destaque>
              )}
              {textoDoIdioma(perfil) && <Destaque rotulo="Idioma">{textoDoIdioma(perfil)}</Destaque>}
            </dl>
            <ListaDeTags titulo="Habilidades técnicas" texto={perfil.habilidades_tecnicas} />
            <ListaDeTags titulo="Competências comportamentais" texto={perfil.competencias_comportamentais} />
            <ListaDeItens titulo="Requisitos obrigatórios" texto={perfil.requisitos_obrigatorios} />
            <ListaDeItens titulo="Requisitos desejáveis" texto={perfil.requisitos_desejaveis} />
          </Secao>
        )}

        <Secao titulo="Cursos aceitos">
          <ul className="flex flex-col divide-y overflow-hidden rounded-xl border text-sm">
            {vaga.cursos.map((curso) => (
              <li key={curso.nome_curso} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="font-medium">{curso.nome_curso}</span>
                  <span className="text-muted-foreground"> · {GRAU_CURSO_LABEL[curso.grau]}</span>
                </span>
                <span
                  className={
                    curso.obrigatorio
                      ? "rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground"
                      : "rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {curso.obrigatorio ? "Obrigatório" : "Desejável"}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-22">
        {acao}
        <section className="rounded-2xl border bg-card p-5 sombra-cartao">
          <h2 className="text-base font-bold">Resumo</h2>
          <dl className="mt-4 flex flex-col gap-3.5">
            <Linha icone={WalletIcon} rotulo="Bolsa-auxílio">
              {textoDaBolsa(vaga.valor_bolsa)}
            </Linha>
            <Linha icone={ClockIcon} rotulo="Carga horária">
              {vaga.carga_horaria_semanal} horas por semana
            </Linha>
            <Linha icone={MapPinIcon} rotulo="Modalidade">
              {TIPO_MODELO_LABEL[vaga.tipo_modelo]}
            </Linha>
            <Linha icone={BusIcon} rotulo="Auxílio-transporte">
              {vaga.auxilio_transporte ? "Sim" : "Não"}
            </Linha>
            <Linha icone={UsersIcon} rotulo="Vagas">
              {vaga.quantidade_posicoes}
            </Linha>
            {vaga.local_atuacao && (
              <Linha icone={NavigationIcon} rotulo="Local">
                {vaga.local_atuacao}
              </Linha>
            )}
            <Linha icone={CalendarClockIcon} rotulo="Inscrições até">
              {vaga.data_limite_inscricao ? formatarData(vaga.data_limite_inscricao) : "Sem data limite"}
            </Linha>
            <Linha icone={CalendarIcon} rotulo="Publicada em">
              {formatarDataDoInstante(vaga.criado_em)}
            </Linha>
          </dl>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border bg-card p-5 text-sm sombra-cartao">
          <div className="flex items-center gap-3">
            <AvatarNome nome={vaga.empresa.nome_fantasia} forma="quadrado" />
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold">{vaga.empresa.nome_fantasia}</h2>
              {vaga.empresa.ramo_atuacao && (
                <p className="truncate text-xs text-muted-foreground">{vaga.empresa.ramo_atuacao}</p>
              )}
            </div>
          </div>
          {vaga.empresa.descricao_empresa && (
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{vaga.empresa.descricao_empresa}</p>
          )}
          {vaga.empresa.site && (
            <a
              href={vaga.empresa.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
            >
              {vaga.empresa.site.replace(/^https:\/\//, "")}
              <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
        </section>
      </aside>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 text-sm sombra-cartao sm:p-6">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

function Pilula({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">{children}</span>;
}

function Destaque({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-muted/70 px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

function Linha({ icone: Icone, rotulo, children }: { icone: LucideIcon; rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-marca-suave text-marca-suave-foreground">
        <Icone className="size-4" />
      </span>
      <div className="flex flex-col">
        <dt className="text-xs text-muted-foreground">{rotulo}</dt>
        <dd className="text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function ListaDeTags({ titulo, texto }: { titulo: string; texto: string | null }) {
  const tags = separarTags(texto);
  if (!tags.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{titulo}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-marca-suave px-3 py-1 text-xs font-semibold text-marca-suave-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListaDeItens({ titulo, texto }: { titulo: string; texto: string | null }) {
  const itens = separarLinhas(texto);
  if (!itens.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{titulo}</h3>
      <ul className="ml-5 flex list-disc flex-col gap-1 marker:text-primary">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
