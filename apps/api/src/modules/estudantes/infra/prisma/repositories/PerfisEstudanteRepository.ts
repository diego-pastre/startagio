import type { PerfilEstudante, PerfilEstudanteData } from "@startagio/contracts";
import { prisma } from "@shared/infra/prisma/client";
import type { IPerfisEstudanteRepository } from "../../../repositories/IPerfisEstudanteRepository";

type PerfilDoBanco = NonNullable<Awaited<ReturnType<typeof prisma.perfilEstudante.findUnique>>>;

function toPerfil({ criado_em, atualizado_em, ...perfil }: PerfilDoBanco): PerfilEstudante {
  return { ...perfil, atualizado_em: atualizado_em.toISOString() };
}

export class PerfisEstudanteRepository implements IPerfisEstudanteRepository {
  async findByUsuarioId(usuarioId: number): Promise<PerfilEstudante | null> {
    const perfil = await prisma.perfilEstudante.findUnique({ where: { usuario_id: usuarioId } });
    return perfil && toPerfil(perfil);
  }

  async save(usuarioId: number, data: PerfilEstudanteData): Promise<PerfilEstudante> {
    const perfil = await prisma.perfilEstudante.upsert({
      where: { usuario_id: usuarioId },
      create: { ...data, usuario_id: usuarioId },
      update: data,
    });
    return toPerfil(perfil);
  }
}
