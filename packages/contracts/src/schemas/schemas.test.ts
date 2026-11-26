import { describe, expect, it } from "vitest";
import { cadastroUsuarioSchema, loginSchema } from "./auth";
import { empresaSchema } from "./empresa";

const cadastroValido = {
  nome_completo: "Ana Souza",
  usuario: "AnaSouza",
  email: "Ana@Exemplo.com",
  senha: "senha-segura",
  data_nascimento: "2004-05-10",
  cpf: "529.982.247-25",
  telefone: "(31) 99876-5432",
  endereco: "",
  nivel_acesso: "ESTUDANTE",
};

describe("cadastroUsuarioSchema", () => {
  it("normaliza login, e-mail, CPF, telefone e endereço vazio", () => {
    const dados = cadastroUsuarioSchema.parse(cadastroValido);
    expect(dados).toMatchObject({
      usuario: "anasouza",
      email: "ana@exemplo.com",
      cpf: "52998224725",
      telefone: "31998765432",
      endereco: null,
    });
  });

  it("recusa menor de 16 anos, login com espaço e perfil desconhecido", () => {
    const resultado = cadastroUsuarioSchema.safeParse({
      ...cadastroValido,
      data_nascimento: new Date().toISOString().slice(0, 10),
      usuario: "ana souza",
      nivel_acesso: "ADMIN",
    });
    expect(resultado.success).toBe(false);
    const campos = resultado.error?.issues.map((issue) => issue.path[0]);
    expect(campos).toEqual(expect.arrayContaining(["data_nascimento", "usuario", "nivel_acesso"]));
  });
});

describe("campos vazios", () => {
  it("mostram 'Campo obrigatório' antes de qualquer outra regra", () => {
    const resultado = cadastroUsuarioSchema.safeParse({
      ...cadastroValido,
      usuario: "",
      email: "",
      senha: "",
      data_nascimento: "",
      cpf: "",
      telefone: "",
    });
    const primeiraMensagem: Record<string, string> = {};
    for (const issue of resultado.error?.issues ?? []) {
      primeiraMensagem[String(issue.path[0])] ??= issue.message;
    }
    expect(primeiraMensagem).toEqual({
      usuario: "Campo obrigatório",
      email: "Campo obrigatório",
      senha: "Campo obrigatório",
      data_nascimento: "Campo obrigatório",
      cpf: "Campo obrigatório",
      telefone: "Campo obrigatório",
    });
  });
});

describe("loginSchema", () => {
  it("aceita usuário ou e-mail e normaliza para minúsculas", () => {
    expect(loginSchema.parse({ login: " Ana@Exemplo.com ", senha: "x" }).login).toBe("ana@exemplo.com");
  });
});

const empresaValida = {
  razao_social: "Tech Vale LTDA",
  nome_fantasia: "Tech Vale",
  cnpj: "11.222.333/0001-81",
  site: "https://techvale.com.br",
  telefone_comercial: "(31) 3822-1000",
  email_contato: "rh@techvale.com.br",
  nome_responsavel: "Carlos Lima",
  cep: "35160-000",
  logradouro: "Av. Pedro Linhares Gomes",
  numero: "3900",
  bairro: "Industrial",
  cidade: "Ipatinga",
  estado: "MG",
};

describe("empresaSchema", () => {
  it("normaliza CNPJ e CEP e transforma opcionais ausentes em null", () => {
    const dados = empresaSchema.parse(empresaValida);
    expect(dados).toMatchObject({ cnpj: "11222333000181", cep: "35160000", complemento: null });
  });

  it("recusa site sem https e UF inexistente", () => {
    const resultado = empresaSchema.safeParse({ ...empresaValida, site: "techvale.com.br", estado: "XX" });
    const campos = resultado.error?.issues.map((issue) => issue.path[0]);
    expect(campos).toEqual(expect.arrayContaining(["site", "estado"]));
  });
});
