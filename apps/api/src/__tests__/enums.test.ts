import { describe, expect, it } from "vitest";
import {
  GRAUS_CURSO,
  NIVEIS_ACESSO,
  NIVEIS_FORMACAO,
  NIVEIS_IDIOMA,
  STATUS_APROVACAO,
  STATUS_VAGA,
  TIPOS_MODELO,
} from "@startagio/contracts";
import { PrismaEnums } from "@shared/infra/prisma/models";

// Se alguém mudar um enum no schema.prisma e esquecer o packages/contracts (ou o contrário), este teste quebra.
describe("enums do contracts x schema.prisma", () => {
  it.each([
    ["NivelAcesso", NIVEIS_ACESSO, PrismaEnums.NivelAcesso],
    ["TipoModelo", TIPOS_MODELO, PrismaEnums.TipoModelo],
    ["StatusVaga", STATUS_VAGA, PrismaEnums.StatusVaga],
    ["NivelFormacao", NIVEIS_FORMACAO, PrismaEnums.NivelFormacao],
    ["NivelIdioma", NIVEIS_IDIOMA, PrismaEnums.NivelIdioma],
    ["GrauCurso", GRAUS_CURSO, PrismaEnums.GrauCurso],
    ["StatusAprovacao", STATUS_APROVACAO, PrismaEnums.StatusAprovacao],
  ])("%s tem os mesmos valores", (_nome, doContracts, doPrisma) => {
    expect([...doContracts].sort()).toEqual(Object.values(doPrisma).sort());
  });
});
