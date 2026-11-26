import { describe, expect, it } from "vitest";
import { formatarCep, formatarCnpj, formatarCpf, formatarTelefone } from "./mascaras";

describe("máscaras", () => {
  it("formata CPF completo e parcial", () => {
    expect(formatarCpf("52998224725")).toBe("529.982.247-25");
    expect(formatarCpf("5299")).toBe("529.9");
    expect(formatarCpf("529.982.247-25999")).toBe("529.982.247-25");
  });

  it("formata CNPJ numérico e alfanumérico", () => {
    expect(formatarCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatarCnpj("12abc34501de35")).toBe("12.ABC.345/01DE-35");
  });

  it("formata telefone fixo e celular", () => {
    expect(formatarTelefone("3138221000")).toBe("(31) 3822-1000");
    expect(formatarTelefone("31998765432")).toBe("(31) 99876-5432");
    expect(formatarTelefone("3")).toBe("(3");
    expect(formatarTelefone("")).toBe("");
  });

  it("formata CEP", () => {
    expect(formatarCep("35160000")).toBe("35160-000");
  });
});
