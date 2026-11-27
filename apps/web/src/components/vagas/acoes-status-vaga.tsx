"use client";

import { EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TRANSICOES_STATUS_VAGA, type StatusVaga, type VagaResumo } from "@startagio/contracts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlterarStatusVaga } from "@/domains/vagas/hooks";
import { mensagemDeErro } from "@/lib/api";

function rotuloDaAcao(de: StatusVaga, para: StatusVaga): string {
  if (para === "ABERTA") return de === "RASCUNHO" ? "Publicar" : "Reabrir";
  if (para === "PAUSADA") return "Pausar";
  return "Encerrar";
}

function mensagemDeSucesso(de: StatusVaga, para: StatusVaga): string {
  if (para === "ABERTA") return de === "RASCUNHO" ? "Vaga publicada." : "Vaga reaberta.";
  if (para === "PAUSADA") return "Vaga pausada. Ela saiu do mural.";
  return "Vaga encerrada.";
}

interface AcoesStatusVagaProps {
  vaga: Pick<VagaResumo, "id" | "titulo" | "status">;
  /** "botoes" na página da vaga (que já tem o próprio botão Editar); "menu" (três pontinhos, com Editar) na lista de vagas. */
  modo: "botoes" | "menu";
}

/** Publicar, pausar, reabrir e encerrar, conforme as transições permitidas para o status atual. No menu, também Editar. */
export function AcoesStatusVaga({ vaga, modo }: AcoesStatusVagaProps) {
  const alterar = useAlterarStatusVaga();
  const [confirmandoEncerrar, setConfirmandoEncerrar] = useState(false);
  const destinos = TRANSICOES_STATUS_VAGA[vaga.status];

  if (!destinos.length) return null;

  function mudar(para: StatusVaga) {
    if (para === "ENCERRADA") {
      setConfirmandoEncerrar(true);
      return;
    }
    executar(para);
  }

  function executar(para: StatusVaga) {
    alterar.mutate(
      { id: vaga.id, status: para },
      {
        onSuccess: () => toast.success(mensagemDeSucesso(vaga.status, para)),
        onError: (erro) => toast.error(mensagemDeErro(erro)),
      },
    );
  }

  return (
    <>
      {modo === "botoes" ? (
        <div className="flex flex-wrap gap-2">
          {destinos.map((para) => (
            <Button
              key={para}
              size="sm"
              variant={para === "ENCERRADA" ? "outline" : "default"}
              disabled={alterar.isPending}
              onClick={() => mudar(para)}
            >
              {rotuloDaAcao(vaga.status, para)}
            </Button>
          ))}
        </div>
      ) : (
        // modal={false}: evita a página travar ao abrir o diálogo de confirmação a partir do menu.
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Ações da vaga ${vaga.titulo}`} disabled={alterar.isPending}>
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Toda vaga com ação de status ainda pode ser editada: só a encerrada não pode, e ela não tem menu. */}
            <DropdownMenuItem asChild>
              <Link href={`/empresa/vagas/${vaga.id}/editar`}>Editar</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {destinos.map((para) => (
              <DropdownMenuItem
                key={para}
                variant={para === "ENCERRADA" ? "destructive" : "default"}
                onSelect={() => mudar(para)}
              >
                {rotuloDaAcao(vaga.status, para)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={confirmandoEncerrar} onOpenChange={setConfirmandoEncerrar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar a vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              “{vaga.titulo}” sai do mural e não poderá ser reaberta. O histórico continua guardado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => executar("ENCERRADA")}>
              Encerrar vaga
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
