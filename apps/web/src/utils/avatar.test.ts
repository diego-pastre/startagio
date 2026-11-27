import { describe, expect, it } from "vitest";
import { iniciais, matizDoNome } from "./avatar";

describe("iniciais", () => {
  it("usa a primeira e a última palavra", () => {
    expect(iniciais("Ana Clara de Souza")).toBe("AS");
  });

  it("ignora o que não começa com letra", () => {
    expect(iniciais("Ana Souza (demo)")).toBe("AS");
  });

  it("nome de uma palavra só dá uma letra", () => {
    expect(iniciais("techmaranhão")).toBe("T");
  });

  it("aceita acento na inicial", () => {
    expect(iniciais("Érica Ângelo")).toBe("ÉÂ");
  });
});

describe("matizDoNome", () => {
  it("fica entre 0 e 359", () => {
    for (const nome of ["", "a", "TechMaranhão", "Norte Analytics", "x".repeat(500)]) {
      const matiz = matizDoNome(nome);
      expect(matiz).toBeGreaterThanOrEqual(0);
      expect(matiz).toBeLessThan(360);
    }
  });

  it("é estável e não liga para maiúsculas nem espaços nas pontas", () => {
    expect(matizDoNome(" Norte Analytics ")).toBe(matizDoNome("norte analytics"));
  });

  it("nomes diferentes costumam dar cores diferentes", () => {
    expect(matizDoNome("TechMaranhão")).not.toBe(matizDoNome("Conecta Soluções"));
  });
});
