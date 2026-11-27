"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, GlobeIcon, InfoIcon, MapPinIcon } from "lucide-react";
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
import { AvatarNome } from "@/components/avatar-nome";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <CapaDaEmpresa empresa={empresa} />
      {!empresa && (
        <Alert className="rounded-2xl border-aviso/40 bg-aviso-suave text-aviso-foreground *:data-[slot=alert-description]:text-aviso-foreground">
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

/** Topo no formato de página de empresa: capa, logo (iniciais), nome e onde fica. */
function CapaDaEmpresa({ empresa }: { empresa: Empresa | null }) {
  return (
    <header className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
      <div className="h-28 bg-gradiente-marca" />
      <div className="flex flex-col gap-3 px-5 pb-5 sm:px-6">
        {empresa ? (
          <AvatarNome nome={empresa.nome_fantasia} forma="quadrado" tamanho="xl" className="-mt-10 rounded-2xl ring-4 ring-card" />
        ) : (
          <span className="-mt-10 flex size-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-4 ring-card">
            <Building2Icon className="size-8" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{empresa?.nome_fantasia ?? "Perfil da empresa"}</h1>
          <p className="text-sm text-muted-foreground">
            {empresa ? (empresa.ramo_atuacao ?? empresa.razao_social) : "Conte quem vocês são para os estudantes"}
          </p>
        </div>
        {empresa && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {empresa.cidade}/{empresa.estado}
            </span>
            {empresa.site && (
              <span className="flex items-center gap-1">
                <GlobeIcon className="size-3.5" />
                {empresa.site.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
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
