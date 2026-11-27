"use client";

import { LockIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Carregando } from "@/components/estados";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useFormularioVaga, useVaga } from "@/domains/vagas/hooks";
import { mensagemDeErro, statusDoErro } from "@/lib/api";
import { AssistenteVaga } from "../../nova/assistente-vaga";
import { valoresDaVagaSalva } from "../../nova/valores-do-formulario";

/** Edição da vaga com o mesmo assistente da criação, já preenchido. */
export function EditarVaga() {
  const id = Number(useParams<{ id: string }>().id);
  const formulario = useFormularioVaga(id);
  const vaga = useVaga(id);
  const valores = useMemo(() => formulario.data && valoresDaVagaSalva(formulario.data.dados), [formulario.data]);

  if (statusDoErro(formulario.error) === 404 || statusDoErro(vaga.error) === 404) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Vaga não encontrada</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }
  if (formulario.isError || vaga.isError) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-3xl">
        <AlertTitle>{mensagemDeErro(formulario.error ?? vaga.error)}</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => void formulario.refetch()}>
            Tentar de novo
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!valores || !vaga.data || !formulario.data) return <Carregando />;

  // Encerrada é definitiva (seção 6.4 do PDF): a API também recusa a edição.
  if (vaga.data.status === "ENCERRADA") {
    return (
      <Empty className="mx-auto max-w-xl rounded-2xl border bg-card sombra-cartao">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockIcon />
          </EmptyMedia>
          <EmptyTitle>Vaga encerrada não pode ser editada</EmptyTitle>
          <EmptyDescription>Ela fica guardada como histórico. Para abrir de novo, crie uma vaga nova.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link href={`/empresa/vagas/${id}`}>Voltar para a vaga</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <AssistenteVaga
      modo={{
        tipo: "editar",
        vagaId: id,
        titulo: vaga.data.titulo,
        valores,
        provaTravada: formulario.data.prova_travada,
      }}
    />
  );
}
