import type { IHashProvider } from "../IHashProvider";

export class FakeHashProvider implements IHashProvider {
  async hash(senha: string): Promise<string> {
    return `hash:${senha}`;
  }

  async compare(senha: string, senhaHash: string): Promise<boolean> {
    return senhaHash === `hash:${senha}`;
  }
}
