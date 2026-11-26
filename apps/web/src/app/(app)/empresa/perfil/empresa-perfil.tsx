"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  empresaSchema,
  formatarCep,
  formatarCnpj,
  formatarTelefone,
  somenteDigitos,
  UFS,
  type Empresa,
  type Uf,
} from "@startagio/contracts";
import { CampoTexto } from "@/components/campo-texto";
import { Carregando } from "@/components/estados";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { buscarCep } from "@/domains/empresas/api";
import { useMinhaEmpresa, useSalvarEmpresa } from "@/domains/empresas/hooks";
import { mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";

export function EmpresaPerfil() {
  const { data: empresa, isPending, isError, error, refetch } = useMinhaEmpresa();

  if (isPending) return <Carregando />;
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{mensagemDeErro(error)}</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dados da empresa</h1>
      {!empresa && (
        <Alert>
          <InfoIcon />
          <AlertDescription>
            Complete os dados jurídicos da sua empresa para habilitar a publicação de vagas de estágio.
          </AlertDescription>
        </Alert>
      )}
      <EmpresaForm key={empresa?.id ?? "nova"} empresa={empresa} />
    </div>
  );
}

function EmpresaForm({ empresa }: { empresa: Empresa | null }) {
  const router = useRouter();
  const salvar = useSalvarEmpresa(Boolean(empresa));
  const form = useForm({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      razao_social: empresa?.razao_social ?? "",
      nome_fantasia: empresa?.nome_fantasia ?? "",
      cnpj: formatarCnpj(empresa?.cnpj ?? ""),
      inscricao_estadual: empresa?.inscricao_estadual ?? "",
      ramo_atuacao: empresa?.ramo_atuacao ?? "",
      site: empresa?.site ?? "",
      descricao_empresa: empresa?.descricao_empresa ?? "",
      telefone_comercial: formatarTelefone(empresa?.telefone_comercial ?? ""),
      email_contato: empresa?.email_contato ?? "",
      nome_responsavel: empresa?.nome_responsavel ?? "",
      cargo_responsavel: empresa?.cargo_responsavel ?? "",
      cep: formatarCep(empresa?.cep ?? ""),
      logradouro: empresa?.logradouro ?? "",
      numero: empresa?.numero ?? "",
      complemento: empresa?.complemento ?? "",
      bairro: empresa?.bairro ?? "",
      cidade: empresa?.cidade ?? "",
      estado: empresa?.estado,
    },
  });

  async function preencherEnderecoPeloCep(cep: string) {
    const digitos = somenteDigitos(cep);
    if (digitos.length !== 8) return;
    try {
      const endereco = await buscarCep(digitos);
      if (!endereco) {
        form.setError("cep", { message: "CEP não encontrado" });
        return;
      }
      const opcoes = { shouldValidate: true, shouldDirty: true };
      // CEP de cidade pequena pode vir sem rua e bairro: só preenche o que veio.
      if (endereco.logradouro) form.setValue("logradouro", endereco.logradouro, opcoes);
      if (endereco.bairro) form.setValue("bairro", endereco.bairro, opcoes);
      form.setValue("cidade", endereco.cidade, opcoes);
      if ((UFS as readonly string[]).includes(endereco.estado)) form.setValue("estado", endereco.estado as Uf, opcoes);
    } catch {
      toast.error("Não foi possível consultar o CEP agora. Preencha o endereço manualmente.");
    }
  }

  const enviar = form.handleSubmit(async (dados) => {
    try {
      await salvar.mutateAsync(dados);
      toast.success("Dados da empresa salvos.");
      if (!empresa) router.replace("/empresa/vagas");
      router.refresh();
    } catch (erro) {
      if (!aplicarErrosDaApi(form.setError, erro)) toast.error(mensagemDeErro(erro));
    }
  });

  return (
    <Card>
      <form onSubmit={enviar} noValidate>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Dados jurídicos</FieldLegend>
              <div className="grid gap-5 sm:grid-cols-2">
                <CampoTexto control={form.control} name="razao_social" label="Razão social" maxLength={150} />
                <CampoTexto control={form.control} name="nome_fantasia" label="Nome fantasia" maxLength={100} />
                <CampoTexto
                  control={form.control}
                  name="cnpj"
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  mascara={formatarCnpj}
                />
                <CampoTexto
                  control={form.control}
                  name="inscricao_estadual"
                  label="Inscrição estadual (opcional)"
                  maxLength={30}
                  descricao='Informe o número ou "ISENTO".'
                />
                <CampoTexto
                  control={form.control}
                  name="ramo_atuacao"
                  label="Ramo de atuação (opcional)"
                  maxLength={80}
                  placeholder="Ex.: Tecnologia da Informação"
                />
                <CampoTexto
                  control={form.control}
                  name="site"
                  label="Site (opcional)"
                  type="url"
                  maxLength={100}
                  placeholder="https://"
                />
              </div>
              <Controller
                control={form.control}
                name="descricao_empresa"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="descricao_empresa">Sobre a empresa (opcional)</FieldLabel>
                    <Textarea
                      id="descricao_empresa"
                      name={field.name}
                      ref={field.ref}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      rows={4}
                      maxLength={2000}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Contato e responsável</FieldLegend>
              <div className="grid gap-5 sm:grid-cols-2">
                <CampoTexto
                  control={form.control}
                  name="telefone_comercial"
                  label="Telefone comercial"
                  type="tel"
                  placeholder="(00) 0000-0000"
                  mascara={formatarTelefone}
                />
                <CampoTexto
                  control={form.control}
                  name="email_contato"
                  label="E-mail do RH"
                  type="email"
                  maxLength={180}
                  descricao="Recebe os avisos de novos candidatos."
                />
                <CampoTexto control={form.control} name="nome_responsavel" label="Nome do responsável" maxLength={100} />
                <CampoTexto
                  control={form.control}
                  name="cargo_responsavel"
                  label="Cargo do responsável (opcional)"
                  maxLength={50}
                />
              </div>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Endereço</FieldLegend>
              <div className="grid gap-5 sm:grid-cols-6">
                <CampoTexto
                  control={form.control}
                  name="cep"
                  label="CEP"
                  inputMode="numeric"
                  placeholder="00000-000"
                  mascara={formatarCep}
                  aoSair={preencherEnderecoPeloCep}
                  className="sm:col-span-2"
                />
                <CampoTexto control={form.control} name="logradouro" label="Logradouro" maxLength={150} className="sm:col-span-4" />
                <CampoTexto control={form.control} name="numero" label="Número" maxLength={20} className="sm:col-span-2" />
                <CampoTexto
                  control={form.control}
                  name="complemento"
                  label="Complemento (opcional)"
                  maxLength={50}
                  className="sm:col-span-4"
                />
                <CampoTexto control={form.control} name="bairro" label="Bairro" maxLength={100} className="sm:col-span-3" />
                <CampoTexto control={form.control} name="cidade" label="Cidade" maxLength={100} className="sm:col-span-2" />
                <Controller
                  control={form.control}
                  name="estado"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="sm:col-span-1">
                      <FieldLabel htmlFor="estado">UF</FieldLabel>
                      <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger id="estado" aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {UFS.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner />}
            {empresa ? "Salvar alterações" : "Cadastrar empresa"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
