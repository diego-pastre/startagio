import type { ITokenProvider } from "../ITokenProvider";

export class FakeTokenProvider implements ITokenProvider {
  sign(usuarioId: number): string {
    return `token-${usuarioId}`;
  }

  verify(token: string): number | null {
    const usuarioId = Number(token.replace("token-", ""));
    return Number.isInteger(usuarioId) ? usuarioId : null;
  }
}
