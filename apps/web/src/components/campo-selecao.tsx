"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampoSelecaoProps<TCampos extends FieldValues, TSaida> {
  control: Control<TCampos, unknown, TSaida>;
  name: Path<TCampos>;
  label: string;
  opcoes: readonly { valor: string; rotulo: string }[];
  placeholder?: string;
  descricao?: string;
  className?: string;
}

/** Select do shadcn ligado ao react-hook-form. Valor vazio mostra o placeholder. */
export function CampoSelecao<TCampos extends FieldValues, TSaida>({
  control,
  name,
  label,
  opcoes,
  placeholder = "Selecione",
  descricao,
  className,
}: CampoSelecaoProps<TCampos, TSaida>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select name={field.name} value={(field.value as string | null | undefined) ?? ""} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={fieldState.invalid} onBlur={field.onBlur} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {opcoes.map((opcao) => (
                <SelectItem key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {descricao && <FieldDescription>{descricao}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
