import type { PerfilEstudante, PerfilEstudanteData } from "@startagio/contracts";

export interface IPerfisEstudanteRepository {
  findByUsuarioId(usuarioId: number): Promise<PerfilEstudante | null>;
  /** Cria na primeira vez e atualiza nas seguintes (um perfil por estudante). */
  save(usuarioId: number, data: PerfilEstudanteData): Promise<PerfilEstudante>;
}
