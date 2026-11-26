"use client";

import type { ComponentProps } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type PropsDaArea = Omit<ComponentProps<typeof Textarea>, "name" | "value" | "defaultValue" | "onChange" | "onBlur">;

interface CampoAreaTextoProps<TCampos extends FieldValues, TSaida> extends PropsDaArea {
  control: Control<TCampos, unknown, TSaida>;
  name: Path<TCampos>;
  label: string;
  descricao?: string;
}

/** Textarea ligado ao react-hook-form, com rótulo e mensagem de erro. */
export function CampoAreaTexto<TCampos extends FieldValues, TSaida>({
  control,
  name,
  label,
  descricao,
  className,
  ...propsDaArea
}: CampoAreaTextoProps<TCampos, TSaida>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Textarea
            {...propsDaArea}
            id={name}
            name={field.name}
            ref={field.ref}
            value={(field.value as string | null | undefined) ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
          {descricao && <FieldDescription>{descricao}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
