export interface ITokenProvider {
  sign(usuarioId: number): string;
  /** Devolve o id do usuário, ou null se o token for inválido ou estiver vencido. */
  verify(token: string): number | null;
}
