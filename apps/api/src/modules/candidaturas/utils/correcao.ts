import type { Alternativa } from "@startagio/contracts";
import type { QuestionarioComGabarito, RespostaCorrigida } from "../dto/CandidaturaDTO";

const duasCasas = (valor: number) => Math.round(valor * 100) / 100;

/** Questões que ficaram sem resposta, no formato de erro por campo que o front entende. */
export function questoesSemResposta(
  questoes: QuestionarioComGabarito["questoes"],
  respostas: Record<string, Alternativa>,
): Record<string, string> {
  return Object.fromEntries(
    questoes.filter((questao) => !respostas[String(questao.id)]).map((questao) => [`respostas.${questao.id}`, "Responda esta questão"]),
  );
}

/**
 * Corrige a prova (seção 6.3 do PDF):
 * Nota = [ soma dos pesos das questões certas ÷ soma dos pesos de todas ] × 10, com duas casas.
 * Resposta de questão que não é desta prova é ignorada.
 */
export function corrigirProva(questoes: QuestionarioComGabarito["questoes"], respostas: Record<string, Alternativa>) {
  const corrigidas: RespostaCorrigida[] = questoes.map((questao) => {
    const marcada = respostas[String(questao.id)];
    return { questao_id: questao.id, marcada, correta: questao.enunciado.correta, acertou: marcada === questao.enunciado.correta };
  });

  const pesoTotal = questoes.reduce((soma, questao) => soma + questao.peso_nota, 0);
  const pesoAcertado = questoes.reduce((soma, questao, i) => soma + (corrigidas[i].acertou ? questao.peso_nota : 0), 0);

  return {
    nota_obtida: pesoTotal > 0 ? duasCasas((pesoAcertado / pesoTotal) * 10) : 0,
    acertos: corrigidas.filter((resposta) => resposta.acertou).length,
    respostas: corrigidas,
  };
}
