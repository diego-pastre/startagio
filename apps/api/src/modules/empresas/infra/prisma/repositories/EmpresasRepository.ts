import type { EmpresaData } from "@startagio/contracts";
import { prisma } from "@shared/infra/prisma/client";
import type { Empresa } from "@shared/infra/prisma/models";
import type { IEmpresasRepository } from "../../../repositories/IEmpresasRepository";

export class EmpresasRepository implements IEmpresasRepository {
  create(usuarioId: number, data: EmpresaData): Promise<Empresa> {
    return prisma.empresa.create({ data: { ...data, usuario_id: usuarioId } });
  }

  update(id: number, data: EmpresaData): Promise<Empresa> {
    return prisma.empresa.update({ where: { id }, data });
  }

  findByUsuarioId(usuarioId: number): Promise<Empresa | null> {
    return prisma.empresa.findUnique({ where: { usuario_id: usuarioId } });
  }

  findByCnpj(cnpj: string): Promise<Empresa | null> {
    return prisma.empresa.findUnique({ where: { cnpj } });
  }
}
