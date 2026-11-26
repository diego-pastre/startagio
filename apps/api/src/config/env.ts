import { config } from "dotenv";
import { z } from "zod";

config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().startsWith("mysql://", "Use o formato mysql://usuario:senha@host:porta/banco"),
  JWT_SECRET: z.string().min(32, "Use um segredo com pelo menos 32 caracteres"),
  JWT_EXPIRES_IN_HORAS: z.coerce.number().positive().default(24),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error("Variáveis de ambiente inválidas (confira o .env):", z.flattenError(resultado.error).fieldErrors);
  throw new Error("Variáveis de ambiente inválidas");
}

export const env = resultado.data;
