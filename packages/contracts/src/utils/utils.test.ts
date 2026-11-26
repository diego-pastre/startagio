import { describe, expect, it } from "vitest";
import { calcularIdade, hojeISO } from "./datas";
import { formatarData, formatarDataDoInstante, formatarMoeda } from "./formatacao";
import { juntarTags, separarLinhas, separarTags } from "./listas";
import { formatarMoedaDigitando, lerMoeda } from "./mascaras";

describe("datas no horário de Brasília", () => {
  it("hoje vira o dia de Brasília, não o de UTC", () => {
    // 02:00 em UTC do dia 27 ainda é 23:00 do dia 26 em Brasília.
    expect(hojeISO(new Date("2026-11-27T02:00:00Z"))).toBe("2026-11-26");
    expect(hojeISO(new Date("2026-11-27T03:00:00Z"))).toBe("2026-11-27");
  });

  it("calcula a idade em anos completos", () => {
    const agora = new Date("2026-11-26T15:00:00Z");
    expect(calcularIdade("2010-11-26", agora)).toBe(16);
    expect(calcularIdade("2010-11-27", agora)).toBe(15);
  });
});

describe("formatação", () => {
  it("formata dinheiro, data e instante", () => {
    expect(formatarMoeda(1350)).toBe("R$ 1.350,00");
    expect(formatarData("2026-12-15")).toBe("15/12/2026");
    expect(formatarData("2026-12-15T00:00:00.000Z")).toBe("15/12/2026");
    expect(formatarDataDoInstante("2026-11-27T02:00:00.000Z")).toBe("26/11/2026");
  });
});

describe("listas", () => {
  it("separa tags sem vazios nem repetidas e junta de volta", () => {
    expect(separarTags("PHP,  sql , Git,php,,")).toEqual(["PHP", "sql", "Git"]);
    expect(separarTags(null)).toEqual([]);
    expect(juntarTags(["PHP", "SQL"])).toBe("PHP, SQL");
  });

  it("separa requisitos por linha e tira marcadores", () => {
    expect(separarLinhas("- Lógica de programação\n\n• SQL básico\r\nGit")).toEqual(["Lógica de programação", "SQL básico", "Git"]);
  });
});

describe("dinheiro digitado", () => {
  it("trata os dígitos como centavos", () => {
    expect(formatarMoedaDigitando("135000")).toBe("1.350,00");
    expect(formatarMoedaDigitando("5")).toBe("0,05");
    expect(formatarMoedaDigitando("R$ 1.350,001")).toBe("13.500,01");
    expect(formatarMoedaDigitando("")).toBe("");
  });

  it("lê o valor do campo de volta como número", () => {
    expect(lerMoeda("1.350,00")).toBe(1350);
    expect(lerMoeda("R$ 99.999.999,99")).toBe(99999999.99);
    expect(lerMoeda("1350.5")).toBe(1350.5);
    expect(lerMoeda(1200)).toBe(1200);
  });
});
