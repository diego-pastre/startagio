import axios from "axios";
import type { Empresa, EmpresaData } from "@startagio/contracts";
import { api, statusDoErro } from "@/lib/api";

/** Ficha da empresa do usuário logado, ou null se ainda não foi preenchida (404). */
export async function buscarMinhaEmpresa(): Promise<Empresa | null> {
  try {
    const { data } = await api.get<Empresa>("/empresas/me");
    return data;
  } catch (erro) {
    if (statusDoErro(erro) === 404) return null;
    throw erro;
  }
}

export async function criarEmpresa(dados: EmpresaData): Promise<Empresa> {
  const { data } = await api.post<Empresa>("/empresas", dados);
  return data;
}

export async function atualizarEmpresa(dados: EmpresaData): Promise<Empresa> {
  const { data } = await api.put<Empresa>("/empresas/me", dados);
  return data;
}

export interface EnderecoDoCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

/** Consulta pública ao ViaCEP (seção 3.3 do PDF). null quando o CEP não existe. */
export async function buscarCep(cep: string): Promise<EnderecoDoCep | null> {
  const { data } = await axios.get<{ erro?: unknown; logradouro: string; bairro: string; localidade: string; uf: string }>(
    `https://viacep.com.br/ws/${cep}/json/`,
  );
  if (data.erro) return null;
  return { logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf };
}
