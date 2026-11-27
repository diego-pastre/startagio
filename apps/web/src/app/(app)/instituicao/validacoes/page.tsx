import { ClipboardCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmBreve } from "@/components/estados";
import { CabecalhoDaPagina } from "@/components/layout/cabecalho-pagina";

export const metadata: Metadata = { title: "Validações" };

export default function ValidacoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDaPagina titulo="Validações de estágio" descricao="Estudantes aprovados pelas empresas" />
      <EmBreve
        icone={ClipboardCheckIcon}
        titulo="Validações de estágio"
        descricao="Aqui a instituição vai acompanhar os estudantes aprovados e validar cada estágio."
        etapa="fase 4, seleção e homologação"
      />
    </div>
  );
}
