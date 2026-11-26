"use client";

import { Controller } from "react-hook-form";
import {
  CARGA_HORARIA_MAXIMA,
  CARGA_HORARIA_MINIMA,
  formatarMoedaDigitando,
  TIPO_MODELO_LABEL,
} from "@startagio/contracts";
import { CampoAreaTexto } from "@/components/campo-area-texto";
import { CampoSelecao } from "@/components/campo-selecao";
import { CampoTexto } from "@/components/campo-texto";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { SUGESTOES_AREAS } from "@/lib/sugestoes";
import { opcoesDe } from "@/utils/vagas";
import type { FormularioVaga } from "./tipos";

/** Etapa 1: tabela vagas. */
export function EtapaDadosGerais({ form }: { form: FormularioVaga }) {
  const { control } = form;

  return (
    <FieldGroup>
      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          control={control}
          name="vaga.titulo"
          label="Título da vaga"
          maxLength={120}
          placeholder="Ex.: Estágio em Desenvolvimento Web"
          className="sm:col-span-2"
        />
        <CampoTexto control={control} name="vaga.area_atuacao" label="Área de atuação" maxLength={80} list="sugestoes-areas" />
        <CampoSelecao control={control} name="vaga.tipo_modelo" label="Modalidade" opcoes={opcoesDe(TIPO_MODELO_LABEL)} />
        <CampoTexto
          control={control}
          name="vaga.carga_horaria_semanal"
          label="Carga horária semanal"
          type="number"
          inputMode="numeric"
          min={CARGA_HORARIA_MINIMA}
          max={CARGA_HORARIA_MAXIMA}
          descricao={`De ${CARGA_HORARIA_MINIMA} a ${CARGA_HORARIA_MAXIMA} horas (Lei do Estágio).`}
        />
        <CampoTexto
          control={control}
          name="vaga.valor_bolsa"
          label="Bolsa-auxílio mensal (R$)"
          inputMode="numeric"
          placeholder="0,00"
          mascara={formatarMoedaDigitando}
          descricao="Vazio significa sem bolsa."
        />
        <CampoTexto
          control={control}
          name="vaga.quantidade_posicoes"
          label="Número de vagas"
          type="number"
          inputMode="numeric"
          min={1}
          max={999}
        />
        <CampoTexto control={control} name="vaga.data_limite_inscricao" label="Inscrições até (opcional)" type="date" />
        <CampoTexto
          control={control}
          name="vaga.local_atuacao"
          label="Local de atuação (opcional)"
          maxLength={150}
          placeholder="Ex.: Ipatinga - MG / Centro"
          className="sm:col-span-2"
        />
        <Controller
          control={control}
          name="vaga.auxilio_transporte"
          render={({ field }) => (
            <Field orientation="horizontal" className="sm:col-span-2">
              <Switch id="vaga.auxilio_transporte" checked={Boolean(field.value)} onCheckedChange={field.onChange} />
              <FieldLabel htmlFor="vaga.auxilio_transporte" className="font-normal">
                Oferece auxílio-transporte
              </FieldLabel>
            </Field>
          )}
        />
      </div>
      <CampoAreaTexto
        control={control}
        name="vaga.descricao"
        label="Atividades do estagiário"
        rows={6}
        maxLength={5000}
        placeholder="O que a pessoa vai fazer no dia a dia"
      />
      <CampoAreaTexto
        control={control}
        name="vaga.beneficios"
        label="Benefícios (opcional)"
        rows={3}
        maxLength={2000}
        placeholder="Ex.: vale-refeição, seguro de vida, curso de inglês"
      />
      <datalist id="sugestoes-areas">
        {SUGESTOES_AREAS.map((area) => (
          <option key={area} value={area} />
        ))}
      </datalist>
    </FieldGroup>
  );
}
