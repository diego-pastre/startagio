import { FUSO_HORARIO } from "./datas";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 1350 → "R$ 1.350,00" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

/** Coluna DATE ("2026-12-15") → "15/12/2026". Não mexe em fuso: a data é a mesma em qualquer lugar. */
export function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Coluna TIMESTAMP (ISO com hora, em UTC) → a data correspondente no horário de Brasília. */
export function formatarDataDoInstante(instante: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_HORARIO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(instante));
}
