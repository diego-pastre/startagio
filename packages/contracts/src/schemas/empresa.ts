import { z } from "zod";
import { UFS } from "../enums";
import { cnpjValido, normalizarCnpj, somenteDigitos } from "../utils/documentos";
import { email, preenchido, telefone, textoObrigatorio, textoOpcional } from "./campos";

/** POST /api/empresas e PUT /api/empresas/me (tabela empresas). */
export const empresaSchema = z.object({
  razao_social: textoObrigatorio(150),
  nome_fantasia: textoObrigatorio(100),
  cnpj: preenchido().transform(normalizarCnpj).refine(cnpjValido, "CNPJ inválido"),
  inscricao_estadual: textoOpcional(30),
  ramo_atuacao: textoOpcional(80),
  site: textoOpcional(100).refine(
    (valor) => valor === null || /^https:\/\/[^\s.]+\.\S+$/.test(valor),
    "Informe o endereço completo, começando com https://",
  ),
  descricao_empresa: textoOpcional(2000),
  telefone_comercial: telefone,
  email_contato: email,
  nome_responsavel: textoObrigatorio(100),
  cargo_responsavel: textoOpcional(50),
  cep: preenchido()
    .transform(somenteDigitos)
    .refine((valor) => valor.length === 8, "CEP inválido"),
  logradouro: textoObrigatorio(150),
  numero: textoObrigatorio(20),
  complemento: textoOpcional(50),
  bairro: textoObrigatorio(100),
  cidade: textoObrigatorio(100),
  estado: z.enum(UFS, "Selecione a UF"),
});

export type EmpresaInput = z.input<typeof empresaSchema>;
export type EmpresaData = z.output<typeof empresaSchema>;
