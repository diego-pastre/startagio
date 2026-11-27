import type { Alternativa, Enunciado } from "@startagio/contracts";

/** Questionário como a API guarda: com a alternativa correta. Nunca sai assim para o estudante. */
export interface QuestionarioComGabarito {
  id: number;
  titulo: string;
  instrucoes: string | null;
  nota_minima_aprovacao: number;
  questoes: { id: number; peso_nota: number; enunciado: Enunciado }[];
}

/** Cada questão corrigida, gravada na coluna pontuacoes.respostas para conferir uma nota contestada. */
export interface RespostaCorrigida {
  questao_id: number;
  marcada: Alternativa;
  correta: Alternativa;
  acertou: boolean;
}

/** Linha nova da tabela pontuacoes. */
export interface NovaCandidatura {
  vaga_id: number;
  estudante_usuario_id: number;
  questionario_id: number;
  nota_obtida: number;
  pontuacao_afinidade: number;
  respostas: RespostaCorrigida[];
}
