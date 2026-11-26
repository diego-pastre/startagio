import { describe, expect, it } from "vitest";
import { cnpjValido, cpfValido, normalizarCnpj, somenteDigitos } from "./documentos";

describe("cpfValido", () => {
  it("aceita CPF válido com e sem máscara", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
  });

  it("recusa dígito verificador errado, tamanho errado e dígitos repetidos", () => {
    expect(cpfValido("529.982.247-24")).toBe(false);
    expect(cpfValido("5299822472")).toBe(false);
    expect(cpfValido("111.111.111-11")).toBe(false);
  });
});

describe("cnpjValido", () => {
  it("aceita CNPJ numérico válido", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
  });

  it("aceita CNPJ alfanumérico válido, inclusive em minúsculas", () => {
    expect(cnpjValido("12.ABC.345/01DE-35")).toBe(true);
    expect(cnpjValido("12.abc.345/01de-35")).toBe(true);
  });

  it("recusa dígito verificador errado e CNPJ repetido", () => {
    expect(cnpjValido("11.222.333/0001-80")).toBe(false);
    expect(cnpjValido("12.ABC.345/01DE-36")).toBe(false);
    expect(cnpjValido("00.000.000/0000-00")).toBe(false);
  });
});

describe("normalização", () => {
  it("tira a máscara", () => {
    expect(somenteDigitos("(31) 99876-5432")).toBe("31998765432");
    expect(normalizarCnpj("12.abc.345/01de-35")).toBe("12ABC34501DE35");
  });
});
