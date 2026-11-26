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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { faixaDeSemestres, textoDaBolsa, textoDoIdioma } from "@/utils/vagas";

/** Página de detalhes da vaga: dados da vaga, perfil desejado, cursos e empresa (Tela 3 do PDF). */
export function VagaDetalhes({ vaga }: { vaga: VagaDetalhe }) {
  const perfil = vaga.perfil_desejado;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{vaga.area_atuacao}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{vaga.titulo}</h1>
          <p className="text-muted-foreground">
            {vaga.empresa.nome_fantasia} · {vaga.empresa.cidade}/{vaga.empresa.estado}
          </p>
        </header>

        <Secao titulo="Sobre a vaga">
          <p className="whitespace-pre-line">{vaga.descricao}</p>
        </Secao>

        {vaga.beneficios && (
          <Secao titulo="Benefícios">
            <p className="whitespace-pre-line">{vaga.beneficios}</p>
          </Secao>
        )}

        {perfil && (
          <Secao titulo="Perfil desejado">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Dado rotulo="Formação">{NIVEL_FORMACAO_LABEL[perfil.nivel_formacao]}</Dado>
              {faixaDeSemestres(perfil.semestre_minimo, perfil.semestre_maximo) && (
                <Dado rotulo="Período">{faixaDeSemestres(perfil.semestre_minimo, perfil.semestre_maximo)}</Dado>
              )}
              {textoDoIdioma(perfil) && <Dado rotulo="Idioma">{textoDoIdioma(perfil)}</Dado>}
            </dl>
            <ListaDeTags titulo="Habilidades técnicas" texto={perfil.habilidades_tecnicas} />
            <ListaDeTags titulo="Competências comportamentais" texto={perfil.competencias_comportamentais} />
            <ListaDeItens titulo="Requisitos obrigatórios" texto={perfil.requisitos_obrigatorios} />
            <ListaDeItens titulo="Requisitos desejáveis" texto={perfil.requisitos_desejaveis} />
          </Secao>
        )}

        <Secao titulo="Cursos aceitos">
          <ul className="divide-y rounded-lg border text-sm">
            {vaga.cursos.map((curso) => (
              <li key={curso.nome_curso} className="flex items-center justify-between gap-3 px-3 py-2">
                <span>
                  {curso.nome_curso} <span className="text-muted-foreground">· {GRAU_CURSO_LABEL[curso.grau]}</span>
                </span>
                <Badge variant={curso.obrigatorio ? "default" : "outline"}>
                  {curso.obrigatorio ? "Obrigatório" : "Desejável"}
                </Badge>
              </li>
            ))}
          </ul>
        </Secao>
      </div>

      <aside className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3">
              <Dado rotulo="Bolsa-auxílio">{textoDaBolsa(vaga.valor_bolsa)}</Dado>
              <Dado rotulo="Carga horária">{vaga.carga_horaria_semanal} horas por semana</Dado>
              <Dado rotulo="Modalidade">{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Dado>
              <Dado rotulo="Auxílio-transporte">{vaga.auxilio_transporte ? "Sim" : "Não"}</Dado>
              <Dado rotulo="Vagas">{vaga.quantidade_posicoes}</Dado>
              {vaga.local_atuacao && <Dado rotulo="Local">{vaga.local_atuacao}</Dado>}
              <Dado rotulo="Inscrições até">
                {vaga.data_limite_inscricao ? formatarData(vaga.data_limite_inscricao) : "Sem data limite"}
              </Dado>
              <Dado rotulo="Publicada em">{formatarDataDoInstante(vaga.criado_em)}</Dado>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre a empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {vaga.empresa.ramo_atuacao && <p className="text-muted-foreground">{vaga.empresa.ramo_atuacao}</p>}
            {vaga.empresa.descricao_empresa && <p className="whitespace-pre-line">{vaga.empresa.descricao_empresa}</p>}
            {vaga.empresa.site && (
              <a
                href={vaga.empresa.site}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-4 hover:underline"
              >
                {vaga.empresa.site.replace(/^https:\/\//, "")}
              </a>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function ListaDeTags({ titulo, texto }: { titulo: string; texto: string | null }) {
  const tags = separarTags(texto);
  if (!tags.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{titulo}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
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
      <h3 className="text-sm font-medium">{titulo}</h3>
      <ul className="ml-5 list-disc text-sm">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
