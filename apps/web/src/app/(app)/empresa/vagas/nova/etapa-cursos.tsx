"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Controller, useFieldArray } from "react-hook-form";
import { GRAU_CURSO_LABEL, QUANTIDADE_MAXIMA_CURSOS } from "@startagio/contracts";
import { CampoSelecao } from "@/components/campo-selecao";
import { CampoTexto } from "@/components/campo-texto";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { SUGESTOES_CURSOS } from "@/lib/sugestoes";
import { opcoesDe } from "@/utils/vagas";
import type { FormularioVaga } from "./tipos";

/** Etapa 3: tabela qualificacoes_cursos, uma lista que cresce com "Adicionar curso". */
export function EtapaCursos({ form }: { form: FormularioVaga }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "qualificacoes_cursos" });
  const erroDaLista = form.formState.errors.qualificacoes_cursos;
  const mensagemDaLista = erroDaLista?.message ?? erroDaLista?.root?.message;

  return (
    <FieldSet>
      <FieldLegend>Cursos aceitos</FieldLegend>
      <FieldDescription>Marque como obrigatório o curso que a pessoa precisa estar fazendo.</FieldDescription>
      <div className="flex flex-col gap-3">
        {fields.map((campo, indice) => (
          <div
            key={campo.id}
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_170px_auto_auto] sm:items-start"
          >
            <CampoTexto
              control={form.control}
              name={`qualificacoes_cursos.${indice}.nome_curso`}
              label="Curso"
              maxLength={120}
              list="sugestoes-cursos"
            />
            <CampoSelecao
              control={form.control}
              name={`qualificacoes_cursos.${indice}.grau`}
              label="Grau"
              opcoes={opcoesDe(GRAU_CURSO_LABEL)}
            />
            <Controller
              control={form.control}
              name={`qualificacoes_cursos.${indice}.obrigatorio`}
              render={({ field }) => (
                <Field orientation="horizontal" className="sm:mt-8 sm:w-auto">
                  <Checkbox
                    id={`curso-${indice}-obrigatorio`}
                    checked={Boolean(field.value)}
                    onCheckedChange={(marcado) => field.onChange(marcado === true)}
                  />
                  <FieldLabel htmlFor={`curso-${indice}-obrigatorio`} className="font-normal">
                    Obrigatório
                  </FieldLabel>
                </Field>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="sm:mt-6"
              aria-label="Remover curso"
              disabled={fields.length === 1}
              onClick={() => remove(indice)}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      {mensagemDaLista && <FieldError>{mensagemDaLista}</FieldError>}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={fields.length >= QUANTIDADE_MAXIMA_CURSOS}
        onClick={() => append({ nome_curso: "", grau: "GRADUACAO", obrigatorio: true })}
      >
        <PlusIcon />
        Adicionar curso
      </Button>
      <datalist id="sugestoes-cursos">
        {SUGESTOES_CURSOS.map((curso) => (
          <option key={curso} value={curso} />
        ))}
      </datalist>
    </FieldSet>
  );
}
