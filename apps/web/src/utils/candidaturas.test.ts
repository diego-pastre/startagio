import { describe, expect, it } from "vitest";
import { faixaDeAfinidade, formatarNota, progressoDaProva } from "./candidaturas";

describe("formatarNota", () => {
  it("usa vírgula e duas casas", () => {
    expect(formatarNota(7.5)).toBe("7,50");
    expect(formatarNota(10)).toBe("10,00");
    expect(formatarNota(3.333)).toBe("3,33");
  });
});

describe("faixaDeAfinidade", () => {
  it("separa em alta (75+), média (50+) e baixa", () => {
    expect(faixaDeAfinidade(75)).toBe("alta");
    expect(faixaDeAfinidade(74.99)).toBe("media");
    expect(faixaDeAfinidade(50)).toBe("media");
    expect(faixaDeAfinidade(12)).toBe("baixa");
  });

  it("null quando não foi calculada", () => {
    expect(faixaDeAfinidade(null)).toBeNull();
  });
});

describe("progressoDaProva", () => {
  it("conta as respondidas e arredonda a porcentagem", () => {
    expect(progressoDaProva(1, 3)).toEqual({ texto: "1 de 3 respondidas", porcentagem: 33 });
    expect(progressoDaProva(1, 1)).toEqual({ texto: "1 de 1 respondida", porcentagem: 100 });
  });

  it("prova vazia não divide por zero", () => {
    expect(progressoDaProva(0, 0).porcentagem).toBe(0);
  });
});
