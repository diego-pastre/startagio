import { compare, hash } from "bcryptjs";
import type { IHashProvider } from "./IHashProvider";

const CUSTO = 10;

export class BcryptHashProvider implements IHashProvider {
  hash(senha: string): Promise<string> {
    return hash(senha, CUSTO);
  }

  compare(senha: string, senhaHash: string): Promise<boolean> {
    return compare(senha, senhaHash);
  }
}
