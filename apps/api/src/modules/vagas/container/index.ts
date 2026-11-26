import { container } from "tsyringe";
import { VagasRepository } from "../infra/prisma/repositories/VagasRepository";
import type { IVagasRepository } from "../repositories/IVagasRepository";

container.registerSingleton<IVagasRepository>("VagasRepository", VagasRepository);
