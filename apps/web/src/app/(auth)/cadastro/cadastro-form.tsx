"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, GraduationCapIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  cadastroUsuarioSchema,
  formatarCpf,
  formatarTelefone,
  NIVEIS_CADASTRO_PUBLICO,
  NIVEL_ACESSO_LABEL,
  type NivelCadastroPublico,
} from "@startagio/contracts";
import { CampoTexto } from "@/components/campo-texto";
import { Cartaz } from "@/components/cartaz";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useCadastro } from "@/domains/auth/hooks";
import { mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";

const formSchema = cadastroUsuarioSchema
  .extend({ confirmar_senha: z.string().min(1, "Campo obrigatório") })
  .refine((dados) => dados.senha === dados.confirmar_senha, {
    message: "As senhas não conferem",
    path: ["confirmar_senha"],
  });

// Instituição de ensino não aparece aqui: essa conta é criada à mão (ver docs/arquitetura.md).
const PERFIL: Record<NivelCadastroPublico, { descricao: string; icone: LucideIcon }> = {
  ESTUDANTE: { descricao: "Procuro vagas de estágio", icone: GraduationCapIcon },
  EMPRESA: { descricao: "Publico vagas de estágio", icone: Building2Icon },
};

export function CadastroForm() {
  const cadastro = useCadastro();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: "",
      usuario: "",
      email: "",
      senha: "",
      confirmar_senha: "",
      data_nascimento: "",
      cpf: "",
      telefone: "",
      endereco: "",
    },
  });

  const enviar = form.handleSubmit(async ({ confirmar_senha, ...dados }) => {
    try {
      await cadastro.mutateAsync(dados);
    } catch (erro) {
      if (!aplicarErrosDaApi(form.setError, erro)) form.setError("root", { message: mensagemDeErro(erro) });
    }
  });

  return (
    <Cartaz className="flex w-full max-w-xl flex-col gap-7 px-6 pt-9 pb-7 sm:px-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[2rem] leading-tight font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Comece escolhendo como vai usar o Startagio.</p>
      </header>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
        <FieldGroup>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          <Controller
            control={form.control}
            name="nivel_acesso"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">Você é</FieldLegend>
                <RadioGroup
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {NIVEIS_CADASTRO_PUBLICO.map((nivel) => {
                    const Icone = PERFIL[nivel].icone;
                    return (
                      <FieldLabel
                        key={nivel}
                        htmlFor={`nivel-${nivel}`}
                        className="rounded-md! transition-colors has-data-checked:border-primary! has-data-checked:bg-marca-suave! has-data-checked:ring-1 has-data-checked:ring-primary"
                      >
                        <Field orientation="vertical" data-invalid={fieldState.invalid} className="gap-2 p-3!">
                          {/* O Field vertical estica cada filho: ícone e rádio ficam juntos numa linha. */}
                          <div className="flex items-start justify-between">
                            <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-has-data-checked/field-label:bg-primary group-has-data-checked/field-label:text-primary-foreground">
                              <Icone className="size-5" />
                            </span>
                            <RadioGroupItem value={nivel} id={`nivel-${nivel}`} aria-invalid={fieldState.invalid} />
                          </div>
                          <FieldContent>
                            <FieldTitle className="font-semibold">{NIVEL_ACESSO_LABEL[nivel]}</FieldTitle>
                            <FieldDescription className="text-xs">{PERFIL[nivel].descricao}</FieldDescription>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    );
                  })}
                </RadioGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto
              control={form.control}
              name="nome_completo"
              label="Nome completo"
              autoComplete="name"
              maxLength={150}
              className="sm:col-span-2"
            />
            <CampoTexto
              control={form.control}
              name="usuario"
              label="Usuário"
              autoComplete="username"
              maxLength={50}
              descricao="De 4 a 50 caracteres, sem espaços."
            />
            <CampoTexto control={form.control} name="email" label="E-mail" type="email" autoComplete="email" maxLength={180} />
            <CampoTexto
              control={form.control}
              name="senha"
              label="Senha"
              type="password"
              autoComplete="new-password"
              maxLength={72}
              descricao="Mínimo de 8 caracteres."
            />
            <CampoTexto
              control={form.control}
              name="confirmar_senha"
              label="Confirme a senha"
              type="password"
              autoComplete="new-password"
              maxLength={72}
            />
            <CampoTexto control={form.control} name="data_nascimento" label="Data de nascimento" type="date" autoComplete="bday" />
            <CampoTexto
              control={form.control}
              name="cpf"
              label="CPF"
              inputMode="numeric"
              placeholder="000.000.000-00"
              mascara={formatarCpf}
            />
            <CampoTexto
              control={form.control}
              name="telefone"
              label="Telefone"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              mascara={formatarTelefone}
            />
            <CampoTexto
              control={form.control}
              name="endereco"
              label="Endereço (opcional)"
              autoComplete="street-address"
              maxLength={255}
            />
          </div>
        </FieldGroup>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner />}
          Criar conta
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </Cartaz>
  );
}
