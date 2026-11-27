"use client";

import { CheckIcon, LockIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Controller, useFieldArray } from "react-hook-form";
import { ALTERNATIVAS, NOTA_MAXIMA, QUANTIDADE_MAXIMA_QUESTOES, type NovaVagaInput } from "@startagio/contracts";
import { CampoAreaTexto } from "@/components/campo-area-texto";
import { CampoTexto } from "@/components/campo-texto";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { FormularioVaga } from "./tipos";

type QuestaoDoFormulario = NovaVagaInput["questionario"]["questoes"][number];

/** Questão em branco. A correta começa vazia de propósito: a empresa precisa marcar. */
export function questaoVazia(): QuestaoDoFormulario {
  return {
    peso_nota: "1",
    enunciado: { pergunta: "", alternativas: { A: "", B: "", C: "", D: "" } },
  } as QuestaoDoFormulario;
}

/**
 * Etapa 4: tabelas questionarios e questoes (Tela 2 do PDF). A candidatura do estudante é a resposta desta prova.
 * `travada`: alguém já respondeu, então a prova aparece só para leitura (docs/banco-de-dados.md).
 */
export function EtapaQuestionario({ form, travada = false }: { form: FormularioVaga; travada?: boolean }) {
  if (travada) return <ProvaTravada form={form} />;
  return <ConstrutorDaProva form={form} />;
}

function ProvaTravada({ form }: { form: FormularioVaga }) {
  const prova = form.getValues("questionario");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-xl border border-aviso/40 bg-aviso-suave p-4 text-sm text-aviso-foreground">
        <LockIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong>A prova está travada.</strong> Candidatos já responderam, e as notas deles foram calculadas com este
          gabarito. Os dados, o perfil e os cursos continuam editáveis.
        </p>
      </div>
      <div>
        <h3 className="text-base font-bold">{prova.titulo}</h3>
        <p className="text-sm text-muted-foreground">Nota mínima {String(prova.nota_minima_aprovacao)}</p>
        {prova.instrucoes && <p className="mt-2 text-sm whitespace-pre-line">{prova.instrucoes}</p>}
      </div>
      <ol className="flex flex-col gap-3">
        {prova.questoes.map((questao, indice) => (
          <li key={indice} className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Questão {indice + 1}</span>
              <span className="text-muted-foreground">Peso {String(questao.peso_nota)}</span>
            </div>
            <p className="mt-2 text-sm font-semibold whitespace-pre-line">{questao.enunciado.pergunta}</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {ALTERNATIVAS.map((letra) => {
                const correta = questao.enunciado.correta === letra;
                return (
                  <li
                    key={letra}
                    className={cn("flex items-center gap-2 rounded-lg px-2 py-1", correta && "bg-sucesso-suave font-medium text-sucesso-foreground")}
                  >
                    <span className="w-4 font-bold">{correta ? <CheckIcon className="size-4" /> : letra}</span>
                    {questao.enunciado.alternativas[letra]}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ConstrutorDaProva({ form }: { form: FormularioVaga }) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "questionario.questoes" });
  const erroDaLista = form.formState.errors.questionario?.questoes;
  const mensagemDaLista = erroDaLista?.message ?? erroDaLista?.root?.message;

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Prova da vaga</FieldLegend>
        <FieldDescription>
          O estudante se candidata fazendo esta prova. A nota sai na hora, e você vê o ranking depois.
        </FieldDescription>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
          <CampoTexto
            control={control}
            name="questionario.titulo"
            label="Título da prova"
            maxLength={150}
            placeholder="Ex.: Avaliação técnica de desenvolvimento web"
          />
          <CampoTexto
            control={control}
            name="questionario.nota_minima_aprovacao"
            label="Nota mínima"
            inputMode="decimal"
            placeholder="6,00"
            descricao={`De 0 a ${NOTA_MAXIMA}.`}
          />
          <CampoAreaTexto
            control={control}
            name="questionario.instrucoes"
            label="Instruções (opcional)"
            rows={3}
            maxLength={2000}
            placeholder="O que o estudante precisa saber antes de começar."
            className="sm:col-span-2"
          />
        </div>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Questões</FieldLegend>
        <FieldDescription>Múltipla escolha, de A a D. Clique na letra para marcar a alternativa correta.</FieldDescription>

        <ol className="flex flex-col gap-4">
          {fields.map((campo, indice) => (
            <li key={campo.id} className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-primary">Questão {indice + 1}</span>
                <div className="flex items-center gap-2">
                  <CampoTexto
                    control={control}
                    name={`questionario.questoes.${indice}.peso_nota`}
                    label="Peso"
                    inputMode="decimal"
                    className="w-20 flex-row items-center gap-2 *:data-[slot=field-label]:text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover questão ${indice + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(indice)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>

              <CampoAreaTexto
                control={control}
                name={`questionario.questoes.${indice}.enunciado.pergunta`}
                label="Pergunta"
                rows={2}
                maxLength={1000}
                className="bg-card"
              />

              <Controller
                control={control}
                name={`questionario.questoes.${indice}.enunciado.correta`}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-2">
                    <RadioGroup
                      aria-label={`Alternativa correta da questão ${indice + 1}`}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      className="gap-2.5"
                    >
                      {ALTERNATIVAS.map((letra) => {
                        const correta = field.value === letra;
                        return (
                          <div key={letra} className="flex items-start gap-2.5">
                            <label
                              htmlFor={`q${indice}-correta-${letra}`}
                              title="Marcar como correta"
                              className={cn(
                                "relative mt-0.5 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border bg-card text-sm font-bold text-muted-foreground transition-colors hover:border-sucesso",
                                "has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                                correta && "border-sucesso bg-sucesso text-white hover:border-sucesso",
                              )}
                            >
                              <RadioGroupItem value={letra} id={`q${indice}-correta-${letra}`} className="absolute size-px opacity-0" />
                              {correta ? <CheckIcon className="size-4" /> : letra}
                            </label>
                            <CampoTexto
                              control={control}
                              name={`questionario.questoes.${indice}.enunciado.alternativas.${letra}`}
                              label={`Alternativa ${letra}`}
                              maxLength={300}
                              className="flex-1 *:data-[slot=field-label]:sr-only"
                              placeholder={`Alternativa ${letra}`}
                            />
                          </div>
                        );
                      })}
                    </RadioGroup>
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              />
            </li>
          ))}
        </ol>

        {mensagemDaLista && <FieldError>{mensagemDaLista}</FieldError>}
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={fields.length >= QUANTIDADE_MAXIMA_QUESTOES}
          onClick={() => append(questaoVazia())}
        >
          <PlusIcon />
          Adicionar questão
        </Button>
      </FieldSet>
    </FieldGroup>
  );
}
