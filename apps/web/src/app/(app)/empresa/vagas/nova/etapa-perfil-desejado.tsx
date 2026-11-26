"use client";

import { NIVEL_FORMACAO_LABEL, NIVEL_IDIOMA_LABEL, SEMESTRE_MAXIMO } from "@startagio/contracts";
import { CampoAreaTexto } from "@/components/campo-area-texto";
import { CampoSelecao } from "@/components/campo-selecao";
import { CampoTags } from "@/components/campo-tags";
import { CampoTexto } from "@/components/campo-texto";
import { FieldGroup } from "@/components/ui/field";
import { SUGESTOES_IDIOMAS } from "@/lib/sugestoes";
import { opcoesDe } from "@/utils/vagas";
import type { FormularioVaga } from "./tipos";

/** Etapa 2: tabela perfil_desejado. */
export function EtapaPerfilDesejado({ form }: { form: FormularioVaga }) {
  const { control } = form;

  return (
    <FieldGroup>
      <div className="grid gap-5 sm:grid-cols-2">
        <CampoSelecao
          control={control}
          name="perfil_desejado.nivel_formacao"
          label="Nível de formação"
          opcoes={opcoesDe(NIVEL_FORMACAO_LABEL)}
          className="sm:col-span-2"
        />
        <CampoTexto
          control={control}
          name="perfil_desejado.semestre_minimo"
          label="Semestre mínimo (opcional)"
          type="number"
          inputMode="numeric"
          min={1}
          max={SEMESTRE_MAXIMO}
        />
        <CampoTexto
          control={control}
          name="perfil_desejado.semestre_maximo"
          label="Semestre máximo (opcional)"
          type="number"
          inputMode="numeric"
          min={1}
          max={SEMESTRE_MAXIMO}
        />
        <CampoTexto
          control={control}
          name="perfil_desejado.idioma_exigido"
          label="Idioma exigido (opcional)"
          maxLength={50}
          list="sugestoes-idiomas"
        />
        <CampoSelecao
          control={control}
          name="perfil_desejado.nivel_idioma"
          label="Nível do idioma"
          opcoes={opcoesDe(NIVEL_IDIOMA_LABEL)}
        />
      </div>
      <CampoTags
        control={control}
        name="perfil_desejado.habilidades_tecnicas"
        label="Habilidades técnicas (opcional)"
        placeholder="Digite e tecle Enter. Ex.: SQL"
      />
      <CampoTags
        control={control}
        name="perfil_desejado.competencias_comportamentais"
        label="Competências comportamentais (opcional)"
        placeholder="Ex.: Trabalho em equipe"
      />
      <CampoAreaTexto
        control={control}
        name="perfil_desejado.requisitos_obrigatorios"
        label="Requisitos obrigatórios (opcional)"
        rows={3}
        maxLength={2000}
        descricao="Um por linha."
      />
      <CampoAreaTexto
        control={control}
        name="perfil_desejado.requisitos_desejaveis"
        label="Requisitos desejáveis (opcional)"
        rows={3}
        maxLength={2000}
        descricao="Um por linha."
      />
      <datalist id="sugestoes-idiomas">
        {SUGESTOES_IDIOMAS.map((idioma) => (
          <option key={idioma} value={idioma} />
        ))}
      </datalist>
    </FieldGroup>
  );
}
