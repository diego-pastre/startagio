"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCapIcon, InfoIcon, LanguagesIcon, SchoolIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  GRAU_CURSO_LABEL,
  NIVEL_IDIOMA_LABEL,
  perfilEstudanteSchema,
  type PerfilEstudante,
  type PerfilEstudanteData,
  type PerfilEstudanteInput,
} from "@startagio/contracts";
import { AvatarNome } from "@/components/avatar-nome";
import { CampoSelecao } from "@/components/campo-selecao";
import { CampoTexto } from "@/components/campo-texto";
import { Carregando } from "@/components/estados";
import { useUsuarioAtual } from "@/components/layout/usuario-atual";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useMeuPerfil, useSalvarPerfil } from "@/domains/estudantes/hooks";
import { mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";
import { SUGESTOES_CURSOS, SUGESTOES_IDIOMAS } from "@/lib/sugestoes";
import { opcoesDe } from "@/utils/vagas";

/** Só aceita voltar para dentro da área do estudante (evita redirecionar para fora do site). */
function destinoSeguro(voltar: string | null): string | null {
  return voltar?.startsWith("/estudante/") ? voltar : null;
}

export function PerfilEstudanteTela() {
  const { data: perfil, isPending, isError, error, refetch } = useMeuPerfil();
  const voltar = destinoSeguro(useSearchParams().get("voltar"));

  if (isPending) return <Carregando />;
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{mensagemDeErro(error)}</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Capa perfil={perfil} />
      {(!perfil || voltar) && (
        <Alert className="rounded-2xl border-aviso/40 bg-aviso-suave text-aviso-foreground *:data-[slot=alert-description]:text-aviso-foreground">
          <InfoIcon />
          <AlertDescription>
            Curso, semestre e idioma entram no cálculo da sua afinidade com cada vaga. Preencha antes de fazer a primeira
            prova.
          </AlertDescription>
        </Alert>
      )}
      <PerfilForm key={perfil?.id ?? "novo"} perfil={perfil} voltar={voltar} />
    </div>
  );
}

function Capa({ perfil }: { perfil: PerfilEstudante | null }) {
  const usuario = useUsuarioAtual();
  return (
    <header className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
      <div className="h-28 bg-gradiente-marca" />
      <div className="flex flex-col gap-3 px-5 pb-5 sm:px-6">
        <AvatarNome nome={usuario.nome_completo} tamanho="xl" className="-mt-10 ring-4 ring-card" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{usuario.nome_completo}</h1>
          <p className="text-sm text-muted-foreground">
            {perfil ? `${perfil.curso} · ${perfil.semestre_atual}º semestre` : "Estudante"}
          </p>
        </div>
        {perfil && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <GraduationCapIcon className="size-3.5" />
              {GRAU_CURSO_LABEL[perfil.grau]}
            </span>
            {perfil.instituicao_ensino && (
              <span className="flex items-center gap-1">
                <SchoolIcon className="size-3.5" />
                {perfil.instituicao_ensino}
              </span>
            )}
            {perfil.idioma && perfil.nivel_idioma && (
              <span className="flex items-center gap-1">
                <LanguagesIcon className="size-3.5" />
                {perfil.idioma} ({NIVEL_IDIOMA_LABEL[perfil.nivel_idioma].toLowerCase()})
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function PerfilForm({ perfil, voltar }: { perfil: PerfilEstudante | null; voltar: string | null }) {
  const router = useRouter();
  const salvar = useSalvarPerfil();
  const form = useForm<PerfilEstudanteInput, unknown, PerfilEstudanteData>({
    resolver: zodResolver(perfilEstudanteSchema),
    defaultValues: {
      curso: perfil?.curso ?? "",
      grau: perfil?.grau ?? "GRADUACAO",
      semestre_atual: perfil ? String(perfil.semestre_atual) : "",
      instituicao_ensino: perfil?.instituicao_ensino ?? "",
      idioma: perfil?.idioma ?? "",
      nivel_idioma: perfil?.nivel_idioma ?? "",
    },
  });
  const idioma = useWatch({ control: form.control, name: "idioma" });

  const enviar = form.handleSubmit(async (dados) => {
    try {
      await salvar.mutateAsync(dados);
      toast.success("Perfil salvo.");
      if (voltar) router.push(voltar);
    } catch (erro) {
      if (!aplicarErrosDaApi(form.setError, erro)) toast.error(mensagemDeErro(erro));
    }
  });

  return (
    <form onSubmit={enviar} noValidate className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
      <div className="p-5 sm:p-6">
        <FieldGroup>
          <FieldSet>
            <FieldLegend className="font-bold">Formação</FieldLegend>
            <div className="grid gap-5 sm:grid-cols-6">
              <CampoTexto
                control={form.control}
                name="curso"
                label="Curso"
                maxLength={120}
                list="sugestoes-cursos-perfil"
                placeholder="Ex.: Sistemas de Informação"
                className="sm:col-span-4"
              />
              <CampoSelecao
                control={form.control}
                name="grau"
                label="Grau"
                opcoes={opcoesDe(GRAU_CURSO_LABEL)}
                className="sm:col-span-2"
              />
              <CampoTexto
                control={form.control}
                name="semestre_atual"
                label="Semestre atual"
                type="number"
                inputMode="numeric"
                min={1}
                max={12}
                className="sm:col-span-2"
              />
              <CampoTexto
                control={form.control}
                name="instituicao_ensino"
                label="Instituição de ensino (opcional)"
                maxLength={150}
                className="sm:col-span-4"
              />
            </div>
            <FieldDescription>Use o nome do curso como aparece nas vagas: é ele que conta na afinidade.</FieldDescription>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend className="font-bold">Idioma (opcional)</FieldLegend>
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoTexto
                control={form.control}
                name="idioma"
                label="Idioma"
                maxLength={50}
                list="sugestoes-idiomas-perfil"
                placeholder="Ex.: Inglês"
              />
              <CampoSelecao
                control={form.control}
                name="nivel_idioma"
                label="Nível"
                placeholder={idioma ? "Selecione" : "Informe o idioma antes"}
                opcoes={opcoesDe(NIVEL_IDIOMA_LABEL)}
              />
            </div>
          </FieldSet>
        </FieldGroup>
      </div>
      <div className="flex justify-end gap-2 border-t bg-muted/40 px-5 py-4 sm:px-6">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner />}
          {voltar ? "Salvar e voltar para a prova" : "Salvar perfil"}
        </Button>
      </div>

      <datalist id="sugestoes-cursos-perfil">
        {SUGESTOES_CURSOS.map((curso) => (
          <option key={curso} value={curso} />
        ))}
      </datalist>
      <datalist id="sugestoes-idiomas-perfil">
        {SUGESTOES_IDIOMAS.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>
    </form>
  );
}
