import { hojeISO, type VagaDetalhe } from "@startagio/contracts";
import { ConflictError, NotFoundError } from "@shared/errors/AppError";

/** Só dá para fazer a prova de vaga aberta e no prazo (mesmo filtro do mural, seção 6.4 do PDF). */
export function garantirInscricaoAberta(vaga: VagaDetalhe | null, hoje: string = hojeISO()): asserts vaga is VagaDetalhe {
  // Vaga pausada, encerrada ou rascunho nem aparece para o estudante: responde como inexistente.
  if (!vaga || vaga.status !== "ABERTA") throw new NotFoundError("Vaga não encontrada.");
  if (vaga.data_limite_inscricao && vaga.data_limite_inscricao < hoje) {
    throw new ConflictError("As inscrições desta vaga terminaram.");
  }
}
