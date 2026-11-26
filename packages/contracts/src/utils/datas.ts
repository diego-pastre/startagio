/** Fuso das regras de data. O PDF compara com CURDATE() de um servidor no Brasil. */
export const FUSO_HORARIO = "America/Sao_Paulo";

/** Data de hoje (YYYY-MM-DD) no horário de Brasília, seja qual for o fuso do computador. */
export function hojeISO(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

/** Idade em anos completos a partir de uma data ISO (YYYY-MM-DD). */
export function calcularIdade(dataIso: string, agora: Date = new Date()): number {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const [anoHoje, mesHoje, diaHoje] = hojeISO(agora).split("-").map(Number);
  let idade = anoHoje - ano;
  if (mesHoje < mes || (mesHoje === mes && diaHoje < dia)) idade -= 1;
  return idade;
}
