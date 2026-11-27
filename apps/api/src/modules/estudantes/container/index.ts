import { container } from "tsyringe";
import { PerfisEstudanteRepository } from "../infra/prisma/repositories/PerfisEstudanteRepository";
import type { IPerfisEstudanteRepository } from "../repositories/IPerfisEstudanteRepository";

container.registerSingleton<IPerfisEstudanteRepository>("PerfisEstudanteRepository", PerfisEstudanteRepository);
