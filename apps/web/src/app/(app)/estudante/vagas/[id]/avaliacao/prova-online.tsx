"use client";

import { ClipboardListIcon, InfoIcon, SendIcon, TargetIcon, UserRoundPenIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ALTERNATIVAS, type Alternativa, type Candidatura, type ProvaDaVaga, type QuestaoDaProva } from "@startagio/contracts";
import { Cartaz } from "@/components/cartaz";
import { Carregando } from "@/components/estados";
import { LinkVoltar } from "@/components/link-voltar";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useProva, useResponderProva } from "@/domains/candidaturas/hooks";
import { useMeuPerfil } from "@/domains/estudantes/hooks";
import { camposDoErro, mensagemDeErro, statusDoErro } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatarNota, progressoDaProva } from "@/utils/candidaturas";
import { ResultadoDaProva } from "./resultado-da-prova";

type Respostas = Partial<Record<string, Alternativa>>;

/** Prova online da vaga (tela /estudante/vagas/:id/avaliacao da seção 4.1 do PDF). */
export function ProvaOnline() {
  const vagaId = Number(useParams<{ id: string }>().id);
  const prova = useProva(vagaId);
  const perfil = useMeuPerfil();
  const [resultado, setResultado] = useState<Candidatura | null>(null);
  const voltarParaVaga = <LinkVoltar href={`/estudante/vagas/${vagaId}`} rotulo="Voltar para a vaga" />;

  if (resultado) return <ResultadoDaProva candidatura={resultado} />;
  if (prova.isPending || perfil.isPending) return <Carregando />;

  if (prova.isError) {
    // 409: já fez a prova, a vaga não tem prova ou o prazo acabou. A API manda a mensagem certa.
    return (
      <Moldura topo={voltarParaVaga}>
        <Aviso
          icone={<InfoIcon />}
          titulo={statusDoErro(prova.error) === 404 ? "Vaga não encontrada" : "Não dá para fazer esta prova"}
          texto={mensagemDeErro(prova.error)}
        >
          <Button asChild variant="outline">
            <Link href="/estudante/minhas-candidaturas">Ver minhas candidaturas</Link>
          </Button>
        </Aviso>
      </Moldura>
    );
  }

  if (!perfil.data) {
    return (
      <Moldura topo={voltarParaVaga}>
        <Aviso
          icone={<UserRoundPenIcon />}
          titulo="Complete seu perfil antes da prova"
          texto="Curso, semestre e idioma entram no cálculo da sua afinidade com a vaga. Leva menos de um minuto."
        >
          <Button asChild>
            <Link href={`/estudante/perfil?voltar=${encodeURIComponent(`/estudante/vagas/${vagaId}/avaliacao`)}`}>
              Preencher meu perfil
            </Link>
          </Button>
        </Aviso>
      </Moldura>
    );
  }

  return <Formulario prova={prova.data} aoConcluir={setResultado} topo={voltarParaVaga} />;
}

function Formulario({
  prova,
  aoConcluir,
  topo,
}: {
  prova: ProvaDaVaga;
  aoConcluir: (candidatura: Candidatura) => void;
  topo: ReactNode;
}) {
  const responder = useResponderProva();
  const [respostas, setRespostas] = useState<Respostas>({});
  const [semResposta, setSemResposta] = useState<Set<number>>(new Set());
  const [confirmando, setConfirmando] = useState(false);

  const respondidas = prova.questoes.filter((questao) => respostas[String(questao.id)]).length;
  const completa = respondidas === prova.questoes.length;
  const progresso = progressoDaProva(respondidas, prova.questoes.length);

  // Fechar a aba no meio da prova perde as respostas: o navegador pergunta antes.
  const emAndamento = respondidas > 0 && !responder.isSuccess;
  useEffect(() => {
    if (!emAndamento) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [emAndamento]);

  function marcar(questaoId: number, alternativa: Alternativa) {
    setRespostas((atuais) => ({ ...atuais, [questaoId]: alternativa }));
    setSemResposta((atuais) => {
      const proximas = new Set(atuais);
      proximas.delete(questaoId);
      return proximas;
    });
  }

  function pedirEnvio() {
    if (completa) {
      setConfirmando(true);
      return;
    }
    const faltando = prova.questoes.filter((questao) => !respostas[String(questao.id)]);
    setSemResposta(new Set(faltando.map((questao) => questao.id)));
    document.getElementById(`questao-${faltando[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast.error(`Faltam ${faltando.length} ${faltando.length === 1 ? "questão" : "questões"} para responder.`);
  }

  function enviar() {
    responder.mutate(
      { vagaId: prova.vaga.id, respostas: respostas as Record<string, Alternativa> },
      {
        onSuccess: (candidatura) => {
          window.scrollTo({ top: 0 });
          aoConcluir(candidatura);
        },
        onError: (erro) => {
          // 422: a API apontou questões sem resposta ("respostas.12").
          const ids = Object.keys(camposDoErro(erro) ?? {}).map((campo) => Number(campo.split(".")[1]));
          if (ids.length) setSemResposta(new Set(ids));
          toast.error(mensagemDeErro(erro));
        },
      },
    );
  }

  return (
    <Moldura topo={topo}>
      {/* A folha da prova presa no mural, como as vagas. */}
      <Cartaz className="flex flex-col gap-5 px-5 pt-9 pb-6 text-sm sm:px-7">
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-muted-foreground">Prova da {prova.vaga.empresa.nome_fantasia}</p>
          <h1 className="text-[1.9rem] leading-[1.05] font-bold text-balance sm:text-[2.3rem]">{prova.vaga.titulo}</h1>
          <p className="text-base text-muted-foreground">{prova.titulo}</p>
        </div>
        {prova.instrucoes && (
          <p className="border-t border-dashed pt-4 leading-relaxed whitespace-pre-line">{prova.instrucoes}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Pilula icone={<ClipboardListIcon />}>
            {prova.questoes.length} {prova.questoes.length === 1 ? "questão" : "questões"}
          </Pilula>
          <Pilula icone={<TargetIcon />}>Nota mínima {formatarNota(prova.nota_minima_aprovacao)}</Pilula>
        </div>
        <p className="text-xs text-muted-foreground">
          Você só pode enviar uma vez. Questões com peso maior valem mais na nota.
        </p>
      </Cartaz>

      {/* Barra de progresso fixa logo abaixo do topo do site. */}
      <div className="sticky top-16 z-30 -mx-1 rounded-md border bg-card/95 px-4 py-3 backdrop-blur sombra-cartao">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold">{progresso.texto}</span>
          <span className="text-muted-foreground">{progresso.porcentagem}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progresso.porcentagem}%` }} />
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {prova.questoes.map((questao, indice) => (
          <CartaoQuestao
            key={questao.id}
            questao={questao}
            numero={indice + 1}
            total={prova.questoes.length}
            marcada={respostas[String(questao.id)]}
            semResposta={semResposta.has(questao.id)}
            aoMarcar={(alternativa) => marcar(questao.id, alternativa)}
          />
        ))}
      </ol>

      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          {completa ? "Tudo respondido. Confira antes de enviar." : `Responda todas as questões para enviar (${progresso.texto}).`}
        </p>
        <Button size="lg" onClick={pedirEnvio} disabled={responder.isPending}>
          {responder.isPending ? <Spinner /> : <SendIcon />}
          Enviar prova
        </Button>
      </div>

      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar a prova?</AlertDialogTitle>
            <AlertDialogDescription>
              Depois de enviar não dá para mudar as respostas nem refazer. A nota sai na hora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={enviar}>Enviar agora</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Moldura>
  );
}

interface CartaoQuestaoProps {
  questao: QuestaoDaProva;
  numero: number;
  total: number;
  marcada: Alternativa | undefined;
  semResposta: boolean;
  aoMarcar: (alternativa: Alternativa) => void;
}

function CartaoQuestao({ questao, numero, total, marcada, semResposta, aoMarcar }: CartaoQuestaoProps) {
  const idDaPergunta = `pergunta-${questao.id}`;
  return (
    <li
      id={`questao-${questao.id}`}
      className={cn(
        "scroll-mt-40 rounded-md border bg-card p-5 sombra-cartao transition-colors sm:p-6",
        semResposta && "border-destructive/60 ring-2 ring-destructive/15",
      )}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-heading font-bold">
          Questão {numero} <span className="font-normal text-muted-foreground">de {total}</span>
        </span>
        <span className="rounded-[3px] border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Peso {formatarNota(questao.peso_nota).replace(",00", "")}
        </span>
      </div>
      <p id={idDaPergunta} className="mt-3 text-base leading-relaxed font-semibold whitespace-pre-line">
        {questao.pergunta}
      </p>
      <RadioGroup
        aria-labelledby={idDaPergunta}
        value={marcada ?? ""}
        onValueChange={(valor) => aoMarcar(valor as Alternativa)}
        className="mt-4 gap-2.5"
      >
        {ALTERNATIVAS.map((letra) => {
          const id = `q${questao.id}-${letra}`;
          const ativa = marcada === letra;
          return (
            <label
              key={letra}
              htmlFor={id}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 text-sm transition-colors hover:bg-muted/60",
                // O rádio fica invisível (o sr-only perde para o "relative" do componente): o foco aparece no cartão inteiro.
                "has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                ativa && "border-primary/60 bg-marca-suave hover:bg-marca-suave",
              )}
            >
              <RadioGroupItem value={letra} id={id} className="absolute size-px opacity-0" />
              {/* Bolinha de gabarito: fica preenchida quando a alternativa é marcada. */}
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-foreground/30 font-heading text-sm font-bold text-muted-foreground transition-colors",
                  ativa && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {letra}
              </span>
              <span className={cn("leading-snug", ativa && "font-medium")}>{questao.alternativas[letra]}</span>
            </label>
          );
        })}
      </RadioGroup>
      {semResposta && <p className="mt-3 text-sm font-medium text-destructive">Responda esta questão.</p>}
    </li>
  );
}

function Moldura({ topo, children }: { topo: ReactNode; children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">{topo}{children}</div>;
}

function Aviso({ icone, titulo, texto, children }: { icone: ReactNode; titulo: string; texto: string; children: ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-md border bg-card px-6 py-12 text-center sombra-cartao">
      <span className="flex size-14 items-center justify-center rounded-full bg-marca-suave text-primary [&_svg]:size-6">
        {icone}
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h1 className="text-xl font-bold">{titulo}</h1>
        <p className="text-sm text-muted-foreground">{texto}</p>
      </div>
      {children}
    </section>
  );
}

function Pilula({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-0.5 text-sm font-medium text-muted-foreground [&_svg]:size-3.5">
      {icone}
      {children}
    </span>
  );
}
