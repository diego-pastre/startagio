"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { loginSchema } from "@startagio/contracts";
import { CampoTexto } from "@/components/campo-texto";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>Use seu usuário ou e-mail.</CardDescription>
      </CardHeader>
      <form onSubmit={enviar} noValidate>
        <CardContent>
          <FieldGroup>
            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            )}
            <CampoTexto control={form.control} name="login" label="Usuário ou e-mail" autoComplete="username" autoFocus />
            <CampoTexto control={form.control} name="senha" label="Senha" type="password" autoComplete="current-password" />
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner />}
            Entrar
          </Button>
          <p className="text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-foreground underline-offset-4 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
