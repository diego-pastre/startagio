import { BadgeCheckIcon, ClipboardCheckIcon, FileSearchIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmBreve } from "@/components/estados";
import { CartaoDicas } from "@/components/layout/cartao-dicas";
import { CartaoPerfil } from "@/components/layout/cartao-perfil";
import { GradeRede } from "@/components/layout/grade-rede";

export const metadata: Metadata = { title: "Validações" };

export default function ValidacoesPage() {
  return (
    <GradeRede
      esquerda={<CartaoPerfil />}
      direita={
        <CartaoDicas
          titulo="Como vai funcionar"
          dicas={[
            { icone: UsersIcon, titulo: "Veja os aprovados", texto: "Estudantes escolhidos pelas empresas chegam aqui." },
            { icone: FileSearchIcon, titulo: "Confira a vaga", texto: "Carga horária, bolsa e curso dentro da Lei do Estágio." },
            { icone: BadgeCheckIcon, titulo: "Valide o estágio", texto: "A homologação fica registrada para todos." },
          ]}
        />
      }
    >
      <EmBreve
        icone={ClipboardCheckIcon}
        titulo="Validações de estágio"
        descricao="Aqui a instituição vai acompanhar os estudantes aprovados e validar cada estágio."
        etapa="fase 4, seleção e homologação"
      />
    </GradeRede>
  );
}
