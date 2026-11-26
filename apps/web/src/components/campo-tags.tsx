"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { juntarTags, separarTags } from "@startagio/contracts";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface CampoTagsProps<TCampos extends FieldValues, TSaida> {
  control: Control<TCampos, unknown, TSaida>;
  name: Path<TCampos>;
  label: string;
  descricao?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Lista de etiquetas (ex.: habilidades). Na tela são etiquetas; no formulário e no banco é o texto
 * separado por vírgula que o PDF define ("SQL, Git, React"). Enter ou vírgula adicionam a etiqueta.
 */
export function CampoTags<TCampos extends FieldValues, TSaida>({
  control,
  name,
  label,
  descricao,
  placeholder,
  className,
}: CampoTagsProps<TCampos, TSaida>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <EditorDeTags
            id={name}
            valor={(field.value as string | null | undefined) ?? ""}
            aoMudar={field.onChange}
            aoSair={field.onBlur}
            invalido={fieldState.invalid}
            placeholder={placeholder}
          />
          {descricao && <FieldDescription>{descricao}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

interface EditorDeTagsProps {
  id: string;
  valor: string;
  aoMudar: (valor: string) => void;
  aoSair: () => void;
  invalido: boolean;
  placeholder?: string;
}

function EditorDeTags({ id, valor, aoMudar, aoSair, invalido, placeholder }: EditorDeTagsProps) {
  const [digitando, setDigitando] = useState("");
  const tags = separarTags(valor);

  function adicionar(texto: string) {
    aoMudar(juntarTags(separarTags(`${valor},${texto}`)));
    setDigitando("");
  }

  function remover(tag: string) {
    aoMudar(juntarTags(tags.filter((item) => item !== tag)));
  }

  return (
    <div
      data-invalid={invalido}
      className={cn(
        "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1 text-base transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 md:text-sm dark:bg-input/30",
        "data-[invalid=true]:border-destructive data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:border-destructive/50",
      )}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => remover(tag)}
            className="rounded-sm text-muted-foreground hover:text-foreground"
            aria-label={`Remover ${tag}`}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={digitando}
        placeholder={tags.length ? undefined : placeholder}
        aria-invalid={invalido}
        className="h-6 min-w-32 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        onChange={(evento) => {
          const texto = evento.target.value;
          if (texto.includes(",")) adicionar(texto);
          else setDigitando(texto);
        }}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") {
            evento.preventDefault();
            if (digitando.trim()) adicionar(digitando);
          } else if (evento.key === "Backspace" && !digitando && tags.length) {
            remover(tags[tags.length - 1]);
          }
        }}
        onBlur={() => {
          if (digitando.trim()) adicionar(digitando);
          aoSair();
        }}
      />
    </div>
  );
}
