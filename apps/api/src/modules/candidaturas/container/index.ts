import { container } from "tsyringe";
import { CandidaturasRepository } from "../infra/prisma/repositories/CandidaturasRepository";
import type { ICandidaturasRepository } from "../repositories/ICandidaturasRepository";

container.registerSingleton<ICandidaturasRepository>("CandidaturasRepository", CandidaturasRepository);
