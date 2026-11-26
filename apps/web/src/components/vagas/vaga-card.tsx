import Link from "next/link";
import { formatarData, formatarDataDoInstante, TIPO_MODELO_LABEL, type VagaResumo } from "@startagio/contracts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resumirCursos, textoDaBolsa } from "@/utils/vagas";

/** Card do mural (Tela 3 do PDF): dados da vaga, da empresa e os cursos aceitos. */
export function VagaCard({ vaga, href }: { vaga: VagaResumo; href: string }) {
  const { visiveis, restantes } = resumirCursos(vaga.cursos);

  return (
    <Card className="relative transition-colors hover:bg-muted/40">
      <CardHeader>
        <CardTitle className="leading-snug">
          {/* O link cobre o card inteiro (after:inset-0), mantendo um único alvo de clique acessível. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {vaga.titulo}
          </Link>
        </CardTitle>
        <CardDescription>
          {vaga.empresa.nome_fantasia} · {vaga.empresa.cidade}/{vaga.empresa.estado}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="font-medium">{textoDaBolsa(vaga.valor_bolsa)}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{TIPO_MODELO_LABEL[vaga.tipo_modelo]}</Badge>
          <Badge variant="secondary">{vaga.carga_horaria_semanal}h por semana</Badge>
          {vaga.auxilio_transporte && <Badge variant="secondary">Auxílio-transporte</Badge>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visiveis.map((curso) => (
            <Badge key={curso.nome_curso} variant="outline">
              {curso.nome_curso}
            </Badge>
          ))}
          {restantes > 0 && <Badge variant="outline">+{restantes}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {vaga.data_limite_inscricao
            ? `Inscrições até ${formatarData(vaga.data_limite_inscricao)}`
            : `Publicada em ${formatarDataDoInstante(vaga.criado_em)}`}
        </p>
      </CardContent>
    </Card>
  );
}
