import { ExternalLinkIcon } from "lucide-react";
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
import { Fita } from "@/components/fita";
import { matizDoNome } from "@/utils/avatar";
import { bolsaCompacta, faixaDeSemestres, textoDaBolsa, textoDoIdioma } from "@/utils/vagas";

/**
 * Página de detalhes da vaga: dados da vaga, perfil desejado, cursos e empresa (Tela 3 do PDF).
 * O cartaz do topo é o destaque; o resto é texto corrido e uma ficha técnica, sem cartões repetidos.
 * `acao` fica no topo da coluna da direita: a candidatura (estudante) ou o resumo da prova (empresa).
 */
export function VagaDetalhes({ vaga, acao }: { vaga: VagaDetalhe; acao?: ReactNode }) {
  const perfil = vaga.perfil_desejado;
  const bolsa = bolsaCompacta(vaga.valor_bolsa);

  return (
    <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
        {/* O cartaz da vaga em tamanho grande: mesma fita (cor da área) do mural. */}
        <header className="relative flex flex-col gap-5 rounded-[3px] border bg-card px-5 pt-9 pb-6 sombra-papel sm:px-7">
          <Fita cor={vaga.area_atuacao} giro={(matizDoNome(vaga.titulo) % 7) - 3} />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{vaga.area_atuacao}</p>
            <h1 className="text-[2rem] leading-[1.05] font-bold text-balance sm:text-[2.6rem]">{vaga.titulo}</h1>
            <p className="flex min-w-0 items-center gap-2">
              <AvatarNome nome={vaga.empresa.nome_fantasia} forma="quadrado" tamanho="sm" className="size-7 rounded-[3px]" />
              <span className="font-medium">{vaga.empresa.nome_fantasia}</span>
              <span className="text-muted-foreground">
                {vaga.empresa.cidade}/{vaga.empresa.estado}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-dashed pt-5">
            <p className="flex items-baseline gap-1.5">
              {bolsa ? (
                <>
                  <span className="font-heading text-3xl leading-none font-bold">
                    <span className="marca-texto">{bolsa}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">por mês</span>
                </>
              ) : (
                <span className="font-heading text-xl font-semibold text-muted-foreground">Sem bolsa</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Etiqueta>{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Etiqueta>
              <Etiqueta>{vaga.carga_horaria_semanal}h por semana</Etiqueta>
              {vaga.auxilio_transporte && <Etiqueta>Auxílio-transporte</Etiqueta>}
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
            <dl className="grid gap-4 sm:grid-cols-3">
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
          <ul className="flex flex-col">
            {vaga.cursos.map((curso) => (
              <li
                key={curso.nome_curso}
                className="flex items-center justify-between gap-3 border-b border-dashed py-2.5 last:border-0"
              >
                <span>
                  <span className="font-medium">{curso.nome_curso}</span>
                  <span className="ml-2 text-muted-foreground">{GRAU_CURSO_LABEL[curso.grau]}</span>
                </span>
                <span
                  className={
                    curso.obrigatorio
                      ? "rounded-[3px] border-[1.5px] border-primary/60 px-2 py-0.5 text-xs font-semibold text-primary"
                      : "rounded-[3px] border-[1.5px] border-dashed px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {curso.obrigatorio ? "Obrigatório" : "Desejável"}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-22">
        {acao}

        <section className="rounded-md border bg-card px-5 py-4">
          <h2 className="text-lg font-bold">Ficha da vaga</h2>
          <dl className="mt-2 flex flex-col text-sm">
            <Linha rotulo="Bolsa-auxílio">{textoDaBolsa(vaga.valor_bolsa)}</Linha>
            <Linha rotulo="Carga horária">{vaga.carga_horaria_semanal} horas por semana</Linha>
            <Linha rotulo="Modalidade">{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Linha>
            <Linha rotulo="Auxílio-transporte">{vaga.auxilio_transporte ? "Sim" : "Não"}</Linha>
            <Linha rotulo="Vagas">{vaga.quantidade_posicoes}</Linha>
            {vaga.local_atuacao && <Linha rotulo="Local">{vaga.local_atuacao}</Linha>}
            <Linha rotulo="Inscrições até">
              {vaga.data_limite_inscricao ? formatarData(vaga.data_limite_inscricao) : "Sem data limite"}
            </Linha>
            <Linha rotulo="Publicada em">{formatarDataDoInstante(vaga.criado_em)}</Linha>
          </dl>
        </section>

        <section className="flex flex-col gap-3 border-t pt-5 text-sm">
          <div className="flex items-center gap-3">
            <AvatarNome nome={vaga.empresa.nome_fantasia} forma="quadrado" className="rounded-[3px]" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold">{vaga.empresa.nome_fantasia}</h2>
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

/** Seção do texto da vaga: sem cartão, só um filete em cima, como num documento. */
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t pt-6 text-sm sm:text-[0.95rem]">
      <h2 className="text-xl font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <span className="rounded-[3px] border px-2.5 py-0.5 text-sm font-medium text-muted-foreground">{children}</span>;
}

function Destaque({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-primary/50 pl-3">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

/** Linha da ficha técnica: rótulo à esquerda, valor à direita, separadas por tracejado. */
function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed py-2.5 last:border-0">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="text-right font-semibold">{children}</dd>
    </div>
  );
}

function ListaDeTags({ titulo, texto }: { titulo: string; texto: string | null }) {
  const tags = separarTags(texto);
  if (!tags.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-semibold">{titulo}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-[3px] border bg-card px-2.5 py-0.5 text-xs font-semibold">
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
      <h3 className="text-base font-semibold">{titulo}</h3>
      <ul className="ml-5 flex list-disc flex-col gap-1 marker:text-primary">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
