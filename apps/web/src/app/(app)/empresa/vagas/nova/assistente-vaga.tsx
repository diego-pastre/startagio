"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { novaVagaSchema, type NovaVagaData, type NovaVagaInput } from "@startagio/contracts";
import { Etapas } from "@/components/etapas";
import { LinkVoltar } from "@/components/link-voltar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCriarVaga, useEditarVaga } from "@/domains/vagas/hooks";
import { camposDoErro, mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";
import { EtapaCursos } from "./etapa-cursos";
import { EtapaDadosGerais } from "./etapa-dados-gerais";
import { EtapaPerfilDesejado } from "./etapa-perfil-desejado";
import { EtapaQuestionario } from "./etapa-questionario";
import { VALORES_DA_VAGA_NOVA } from "./valores-do-formulario";

// Cada etapa valida o próprio grupo de campos antes de avançar (Tela 2 do PDF).
const ETAPAS = [
  { titulo: "Dados gerais", grupo: "vaga" },
  { titulo: "Perfil desejado", grupo: "perfil_desejado" },
  { titulo: "Cursos aceitos", grupo: "qualificacoes_cursos" },
  { titulo: "Prova", grupo: "questionario" },
] as const;

/** Em qual etapa fica um campo ("perfil_desejado.nivel_idioma" → 1). */
function etapaDoCampo(caminho: string): number {
  const indice = ETAPAS.findIndex((etapa) => caminho === etapa.grupo || caminho.startsWith(`${etapa.grupo}.`));
  return Math.max(indice, 0);
}

export type ModoDoAssistente =
  | { tipo: "criar" }
  | { tipo: "editar"; vagaId: number; titulo: string; valores: NovaVagaInput; provaTravada: boolean };

/** Assistente de 4 etapas: cria a vaga (com rascunho ou publicação) ou edita uma vaga existente. */
export function AssistenteVaga({ modo }: { modo: ModoDoAssistente }) {
  const router = useRouter();
  const criar = useCriarVaga();
  const editar = useEditarVaga();
  const edicao = modo.tipo === "editar" ? modo : null;
  const [etapa, setEtapa] = useState(0);
  const form = useForm<NovaVagaInput, unknown, NovaVagaData>({
    resolver: zodResolver(novaVagaSchema),
    defaultValues: (edicao?.valores ?? VALORES_DA_VAGA_NOVA) as DefaultValues<NovaVagaInput>,
  });
  const ultimaEtapa = etapa === ETAPAS.length - 1;
  const enviando = form.formState.isSubmitting;
  const voltarPara = edicao ? `/empresa/vagas/${edicao.vagaId}` : "/empresa/vagas";

  function irPara(indice: number) {
    setEtapa(indice);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function avancar() {
    if (await form.trigger(ETAPAS[etapa].grupo)) irPara(etapa + 1);
  }

  function tratarErro(erro: unknown) {
    const campos = Object.keys(camposDoErro(erro) ?? {});
    if (aplicarErrosDaApi(form.setError, erro)) irPara(Math.min(...campos.map(etapaDoCampo)));
    else toast.error(mensagemDeErro(erro));
  }

  async function enviar(dados: NovaVagaData) {
    try {
      if (edicao) {
        const { vaga: { status: _status, ...vaga }, questionario, ...resto } = dados;
        // Prova travada não vai no PUT: a API mantém a que já foi respondida.
        await editar.mutateAsync({
          id: edicao.vagaId,
          dados: { ...resto, vaga, questionario: edicao.provaTravada ? undefined : questionario },
        });
        toast.success("Vaga atualizada.");
        router.push(voltarPara);
        return;
      }
      const vaga = await criar.mutateAsync(dados);
      toast.success(dados.vaga.status === "RASCUNHO" ? "Rascunho salvo." : "Vaga publicada.");
      router.push(`/empresa/vagas/${vaga.id}`);
    } catch (erro) {
      tratarErro(erro);
    }
  }

  function concluir(status?: "RASCUNHO" | "ABERTA") {
    if (status) form.setValue("vaga.status", status);
    void form.handleSubmit(enviar, (erros) => irPara(Math.min(...Object.keys(erros).map(etapaDoCampo))))();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <LinkVoltar href={voltarPara} rotulo={edicao ? "Voltar para a vaga" : "Minhas vagas"} />

      <header className="overflow-hidden rounded-2xl border bg-card sombra-cartao">
        <div className="bg-gradiente-marca px-5 py-5 text-white sm:px-6">
          <p className="text-xs font-semibold tracking-wider text-white/75 uppercase">
            Etapa {etapa + 1} de {ETAPAS.length}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">{edicao ? "Editar vaga" : "Nova vaga"}</h1>
          <p className="text-sm text-white/80">
            {edicao ? edicao.titulo : "Quanto mais clara a vaga, melhores os candidatos."}
          </p>
        </div>
        <div className="px-5 py-4 sm:px-6">
          {/* Na edição tudo já está preenchido: dá para pular direto para qualquer etapa. */}
          <Etapas
            titulos={ETAPAS.map((item) => item.titulo)}
            atual={etapa}
            aoSelecionar={irPara}
            todasLiberadas={Boolean(edicao)}
          />
        </div>
      </header>

      <Card>
        {/* Enter dentro de um campo não envia: o envio é só pelos botões do rodapé. */}
        <form noValidate onSubmit={(evento) => evento.preventDefault()}>
          <CardContent>
            {etapa === 0 && <EtapaDadosGerais form={form} />}
            {etapa === 1 && <EtapaPerfilDesejado form={form} />}
            {etapa === 2 && <EtapaCursos form={form} />}
            {etapa === 3 && <EtapaQuestionario form={form} travada={edicao?.provaTravada ?? false} />}
          </CardContent>
          <CardFooter className="mt-6 flex flex-wrap justify-between gap-2">
            <Button type="button" variant="outline" disabled={etapa === 0 || enviando} onClick={() => irPara(etapa - 1)}>
              Voltar
            </Button>
            <div className="flex flex-wrap gap-2">
              {edicao ? (
                <>
                  {!ultimaEtapa && (
                    <Button type="button" variant="outline" onClick={avancar}>
                      Próximo
                    </Button>
                  )}
                  <Button type="button" disabled={enviando} onClick={() => concluir()}>
                    {enviando ? <Spinner /> : <SaveIcon />}
                    Salvar alterações
                  </Button>
                </>
              ) : ultimaEtapa ? (
                <>
                  <Button type="button" variant="outline" disabled={enviando} onClick={() => concluir("RASCUNHO")}>
                    Salvar rascunho
                  </Button>
                  <Button type="button" disabled={enviando} onClick={() => concluir("ABERTA")}>
                    {enviando && <Spinner />}
                    Publicar vaga
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={avancar}>
                  Próximo
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
