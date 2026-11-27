"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { loginSchema } from "@startagio/contracts";
import { CampoTexto } from "@/components/campo-texto";
import { Cartaz } from "@/components/cartaz";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/domains/auth/hooks";
import { mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";

/** O login é mais um cartaz preso no mural. */
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
    <Cartaz className="flex w-full max-w-sm flex-col gap-7 px-7 pt-9 pb-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[2rem] leading-tight font-bold">Entrar</h1>
        <p className="text-sm text-muted-foreground">Com seu usuário ou e-mail.</p>
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

      <p className="border-t border-dashed pt-5 text-center text-sm text-muted-foreground">
        Primeira vez aqui?{" "}
        <Link href="/cadastro" className="font-semibold text-primary underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </Cartaz>
  );
}
