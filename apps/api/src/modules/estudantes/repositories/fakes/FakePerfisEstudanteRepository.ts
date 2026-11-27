import type { PerfilEstudante, PerfilEstudanteData } from "@startagio/contracts";
import type { IPerfisEstudanteRepository } from "../IPerfisEstudanteRepository";

export class FakePerfisEstudanteRepository implements IPerfisEstudanteRepository {
  private perfis: PerfilEstudante[] = [];

  async findByUsuarioId(usuarioId: number): Promise<PerfilEstudante | null> {
    return this.perfis.find((perfil) => perfil.usuario_id === usuarioId) ?? null;
  }

  async save(usuarioId: number, data: PerfilEstudanteData): Promise<PerfilEstudante> {
    const existente = await this.findByUsuarioId(usuarioId);
    const perfil: PerfilEstudante = {
      ...data,
      id: existente?.id ?? this.perfis.length + 1,
      usuario_id: usuarioId,
      atualizado_em: new Date().toISOString(),
    };
    this.perfis = [...this.perfis.filter((item) => item.usuario_id !== usuarioId), perfil];
    return perfil;
  }
}
