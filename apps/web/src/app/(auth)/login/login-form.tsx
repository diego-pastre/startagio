"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { loginSchema } from "@startagio/contracts";
import { CampoTexto } from "@/components/campo-texto";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/domains/auth/hooks";
import { mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";

export function LoginForm() {
  const login = useLogin();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", senha: "" },
  });

  const enviar = form.handleSubmit(async (dados) => {
    try {
      await login.mutateAsync(dados);
    } catch (erro) {
      if (!aplicarErrosDaApi(form.setError, erro)) form.setError("root", { message: mensagemDeErro(erro) });
    }
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Que bom te ver de novo</h1>
        <p className="text-muted-foreground">Entre com seu usuário ou e-mail para continuar.</p>
      </header>

      <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
        <FieldGroup>
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}
          <CampoTexto control={form.control} name="login" label="Usuário ou e-mail" autoComplete="username" autoFocus />
          <CampoTexto control={form.control} name="senha" label="Senha" type="password" autoComplete="current-password" />
        </FieldGroup>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner />}
          Entrar
        </Button>
      </form>

      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Novo no Startagio?</FieldSeparator>

      <Button asChild variant="outline" size="lg" className="w-full border-primary/40 text-primary hover:bg-marca-suave hover:text-primary">
        <Link href="/cadastro">Criar uma conta</Link>
      </Button>
    </div>
  );
}
