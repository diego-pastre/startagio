import jwt from "jsonwebtoken";
import { env } from "@config/env";
import type { ITokenProvider } from "./ITokenProvider";

export class JwtTokenProvider implements ITokenProvider {
  sign(usuarioId: number): string {
    return jwt.sign({}, env.JWT_SECRET, {
      subject: String(usuarioId),
      expiresIn: env.JWT_EXPIRES_IN_HORAS * 60 * 60,
      algorithm: "HS256",
    });
  }

  verify(token: string): number | null {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
      const usuarioId = typeof payload === "string" ? Number.NaN : Number(payload.sub);
      return Number.isInteger(usuarioId) ? usuarioId : null;
    } catch {
      return null;
    }
  }
}
