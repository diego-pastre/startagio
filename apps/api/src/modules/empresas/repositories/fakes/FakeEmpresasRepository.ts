import type { EmpresaData } from "@startagio/contracts";
import type { Empresa } from "@shared/infra/prisma/models";
import type { IEmpresasRepository } from "../IEmpresasRepository";

export class FakeEmpresasRepository implements IEmpresasRepository {
  private empresas: Empresa[] = [];

  async create(usuarioId: number, data: EmpresaData): Promise<Empresa> {
    const agora = new Date();
    const empresa: Empresa = { ...data, id: this.empresas.length + 1, usuario_id: usuarioId, criado_em: agora, atualizado_em: agora };
    this.empresas.push(empresa);
    return empresa;
  }

  async update(id: number, data: EmpresaData): Promise<Empresa> {
    const indice = this.empresas.findIndex((empresa) => empresa.id === id);
    const empresa = { ...this.empresas[indice], ...data, atualizado_em: new Date() };
    this.empresas[indice] = empresa;
    return empresa;
  }

  async findByUsuarioId(usuarioId: number): Promise<Empresa | null> {
    return this.empresas.find((empresa) => empresa.usuario_id === usuarioId) ?? null;
  }

  async findByCnpj(cnpj: string): Promise<Empresa | null> {
    return this.empresas.find((empresa) => empresa.cnpj === cnpj) ?? null;
  }
}
