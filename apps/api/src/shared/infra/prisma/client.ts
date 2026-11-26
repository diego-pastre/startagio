import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "@config/env";
import { PrismaClient } from "../../../generated/prisma/client";

// O CLI do Prisma exige DATABASE_URL no formato mysql://; o driver do MariaDB recebe as partes separadas.
const url = new URL(env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
