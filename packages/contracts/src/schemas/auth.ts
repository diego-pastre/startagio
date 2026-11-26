import { z } from "zod";
import { NIVEIS_ACESSO } from "../enums";
import { calcularIdade } from "../utils/datas";
import { cpfValido, somenteDigitos } from "../utils/documentos";
import { email, preenchido, telefone, textoObrigatorio, textoOpcional } from "./campos";

export const IDADE_MINIMA_ESTAGIO = 16;

/** POST /api/auth/register (tabela usuarios). */
export const cadastroUsuarioSchema = z.object({
  nome_completo: textoObrigatorio(150),
  usuario: preenchido()
    .toLowerCase()
    .min(4, "Mínimo de 4 caracteres")
    .max(50, "Máximo de 50 caracteres")
    .regex(/^\S+$/, "Não use espaços"),
  email,
  // bcrypt só considera os primeiros 72 bytes da senha.
  senha: z
    .string({ error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .min(8, "Mínimo de 8 caracteres")
    .max(72, "Máximo de 72 caracteres"),
  data_nascimento: preenchido()
    .pipe(z.iso.date("Data inválida"))
    .refine(
      (data) => calcularIdade(data) >= IDADE_MINIMA_ESTAGIO,
      `Idade mínima de ${IDADE_MINIMA_ESTAGIO} anos`,
    ),
  cpf: preenchido().transform(somenteDigitos).refine(cpfValido, "CPF inválido"),
  telefone,
  endereco: textoOpcional(255),
  nivel_acesso: z.enum(NIVEIS_ACESSO, "Escolha um perfil"),
});

export type CadastroUsuarioInput = z.input<typeof cadastroUsuarioSchema>;
export type CadastroUsuarioData = z.output<typeof cadastroUsuarioSchema>;

/** POST /api/auth/login: aceita o usuário ou o e-mail no mesmo campo. */
export const loginSchema = z.object({
  login: preenchido().toLowerCase(),
  senha: z.string({ error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginData = z.output<typeof loginSchema>;
