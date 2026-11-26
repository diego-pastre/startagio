"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCriarVaga } from "@/domains/vagas/hooks";
import { camposDoErro, mensagemDeErro } from "@/lib/api";
import { aplicarErrosDaApi } from "@/lib/formularios";
import { EtapaCursos } from "./etapa-cursos";
import { EtapaDadosGerais } from "./etapa-dados-gerais";
import { EtapaPerfilDesejado } from "./etapa-perfil-desejado";

// Cada etapa valida o próprio grupo de campos antes de avançar (Tela 2 do PDF).
// A etapa 4 (questionário) entra na fase 3.
const ETAPAS = [
  { titulo: "Dados gerais", grupo: "vaga" },
  { titulo: "Perfil desejado", grupo: "perfil_desejado" },
  { titulo: "Cursos aceitos", grupo: "qualificacoes_cursos" },
] as const;

const VALORES_INICIAIS: DefaultValues<NovaVagaInput> = {
  vaga: {
    titulo: "",
    area_atuacao: "",
    tipo_modelo: "PRESENCIAL",
    carga_horaria_semanal: "",
    valor_bolsa: "",
    auxilio_transporte: true,
    quantidade_posicoes: "1",
    local_atuacao: "",
    data_limite_inscricao: "",
    descricao: "",
    beneficios: "",
    status: "ABERTA",
  },
  perfil_desejado: {
    semestre_minimo: "1",
    semestre_maximo: "",
    idioma_exigido: "",
    nivel_idioma: "",
    habilidades_tecnicas: "",
    competencias_comportamentais: "",
    requisitos_obrigatorios: "",
    requisitos_desejaveis: "",
  },
  qualificacoes_cursos: [{ nome_curso: "", grau: "GRADUACAO", obrigatorio: true }],
};

/** Em qual etapa fica um campo ("perfil_desejado.nivel_idioma" → 1). */
function etapaDoCampo(caminho: string): number {
  const indice = ETAPAS.findIndex((etapa) => caminho === etapa.grupo || caminho.startsWith(`${etapa.grupo}.`));
  return Math.max(indice, 0);
}

export function NovaVagaAssistente() {
  const router = useRouter();
  const criar = useCriarVaga();
  const [etapa, setEtapa] = useState(0);
  const form = useForm<NovaVagaInput, unknown, NovaVagaData>({
    resolver: zodResolver(novaVagaSchema),
    defaultValues: VALORES_INICIAIS,
  });
  const ultimaEtapa = etapa === ETAPAS.length - 1;
  const enviando = form.formState.isSubmitting;

  function irPara(indice: number) {
    setEtapa(indice);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function avancar() {
    if (await form.trigger(ETAPAS[etapa].grupo)) irPara(etapa + 1);
  }

  async function enviar(dados: NovaVagaData) {
    try {
      const vaga = await criar.mutateAsync(dados);
      toast.success(dados.vaga.status === "RASCUNHO" ? "Rascunho salvo." : "Vaga publicada.");
      router.push(`/empresa/vagas/${vaga.id}`);
    } catch (erro) {
      const campos = Object.keys(camposDoErro(erro) ?? {});
      if (aplicarErrosDaApi(form.setError, erro)) irPara(Math.min(...campos.map(etapaDoCampo)));
      else toast.error(mensagemDeErro(erro));
    }
  }

  function concluir(status: "RASCUNHO" | "ABERTA") {
    form.setValue("vaga.status", status);
    void form.handleSubmit(enviar, (erros) => irPara(Math.min(...Object.keys(erros).map(etapaDoCampo))))();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <LinkVoltar href="/empresa/vagas" rotulo="Minhas vagas" />
        <h1 className="text-2xl font-semibold tracking-tight">Nova vaga</h1>
      </div>

      <Etapas titulos={ETAPAS.map((item) => item.titulo)} atual={etapa} aoSelecionar={irPara} />

      <Card>
        {/* Enter dentro de um campo não envia: o envio é só pelos botões do rodapé. */}
        <form noValidate onSubmit={(evento) => evento.preventDefault()}>
          <CardContent>
            {etapa === 0 && <EtapaDadosGerais form={form} />}
            {etapa === 1 && <EtapaPerfilDesejado form={form} />}
            {etapa === 2 && <EtapaCursos form={form} />}
          </CardContent>
          <CardFooter className="mt-6 flex flex-wrap justify-between gap-2">
            <Button type="button" variant="outline" disabled={etapa === 0 || enviando} onClick={() => irPara(etapa - 1)}>
              Voltar
            </Button>
            {ultimaEtapa ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={enviando} onClick={() => concluir("RASCUNHO")}>
                  Salvar rascunho
                </Button>
                <Button type="button" disabled={enviando} onClick={() => concluir("ABERTA")}>
                  {enviando && <Spinner />}
                  Publicar vaga
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={avancar}>
                Próximo
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
