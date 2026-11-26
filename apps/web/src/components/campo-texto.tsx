"use client";

import type { ComponentProps } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PropsDoInput = Omit<ComponentProps<typeof Input>, "name" | "value" | "defaultValue" | "onChange" | "onBlur">;

interface CampoTextoProps<TCampos extends FieldValues, TSaida> extends PropsDoInput {
  control: Control<TCampos, unknown, TSaida>;
  name: Path<TCampos>;
  label: string;
  descricao?: string;
  /** Máscara aplicada a cada tecla (ex.: formatarCpf). */
  mascara?: (valor: string) => string;
  /** Chamado ao sair do campo, com o valor atual (ex.: buscar o CEP). */
  aoSair?: (valor: string) => void;
}

/** Input de texto ligado ao react-hook-form, com rótulo e mensagem de erro do campo. */
export function CampoTexto<TCampos extends FieldValues, TSaida>({
  control,
  name,
  label,
  descricao,
  mascara,
  aoSair,
  className,
  ...propsDoInput
}: CampoTextoProps<TCampos, TSaida>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...propsDoInput}
            id={name}
            name={field.name}
            ref={field.ref}
            value={(field.value as string | null | undefined) ?? ""}
            aria-invalid={fieldState.invalid}
            onChange={(evento) => field.onChange(mascara ? mascara(evento.target.value) : evento.target.value)}
            onBlur={(evento) => {
              field.onBlur();
              aoSair?.(evento.target.value);
            }}
          />
          {descricao && <FieldDescription>{descricao}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
