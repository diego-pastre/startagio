import { describe, expect, it } from "vitest";
import { TIPO_MODELO_LABEL } from "@startagio/contracts";
import {
  bolsaCompacta,
  faixaDeSemestres,
  inscricoesEncerradas,
  opcoesDe,
  resumirCursos,
  textoDaBolsa,
  textoDoIdioma,
} from "./vagas";

describe("bolsa no cartaz", () => {
  it("esconde os centavos só quando o valor é redondo", () => {
    expect(bolsaCompacta(1250)).toBe("R$ 1.250");
    expect(bolsaCompacta(1250.5)).toBe("R$ 1.250,50");
    expect(bolsaCompacta(0)).toBeNull();
  });
});

describe("textos da vaga", () => {
  it("descreve a faixa de semestres", () => {
    expect(faixaDeSemestres(3, 7)).toBe("Do 3º ao 7º semestre");
    expect(faixaDeSemestres(4, 4)).toBe("4º semestre");
    expect(faixaDeSemestres(5, null)).toBe("A partir do 5º semestre");
    expect(faixaDeSemestres(1, null)).toBeNull();
    expect(faixaDeSemestres(null, 6)).toBe("Até o 6º semestre");
  });

  it("descreve bolsa e idioma", () => {
    expect(textoDaBolsa(1350)).toBe("R$ 1.350,00/mês");
    expect(textoDaBolsa(0)).toBe("Sem bolsa");
    expect(textoDoIdioma({ idioma_exigido: "Inglês", nivel_idioma: "INTERMEDIARIO" })).toBe("Inglês (intermediário)");
    expect(textoDoIdioma({ idioma_exigido: null, nivel_idioma: null })).toBeNull();
  });

  it("sabe se as inscrições já encerraram", () => {
    expect(inscricoesEncerradas("2026-11-25", "2026-11-26")).toBe(true);
    expect(inscricoesEncerradas("2026-11-26", "2026-11-26")).toBe(false);
    expect(inscricoesEncerradas(null, "2026-11-26")).toBe(false);
  });

  it("resume cursos e monta opções de select", () => {
    const cursos = ["A", "B", "C", "D"].map((nome) => ({ nome_curso: nome, grau: "GRADUACAO" as const, obrigatorio: true }));
    expect(resumirCursos(cursos)).toMatchObject({ restantes: 1 });
    expect(opcoesDe(TIPO_MODELO_LABEL)[1]).toEqual({ valor: "HIBRIDO", rotulo: "Híbrido" });
  });
});
