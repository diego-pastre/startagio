import type { EmpresaData } from "@startagio/contracts";
import type { Empresa } from "@shared/infra/prisma/models";

export interface IEmpresasRepository {
  create(usuarioId: number, data: EmpresaData): Promise<Empresa>;
  update(id: number, data: EmpresaData): Promise<Empresa>;
  findByUsuarioId(usuarioId: number): Promise<Empresa | null>;
  findByCnpj(cnpj: string): Promise<Empresa | null>;
}
