import { container } from "tsyringe";
import { EmpresasRepository } from "../infra/prisma/repositories/EmpresasRepository";
import type { IEmpresasRepository } from "../repositories/IEmpresasRepository";

container.registerSingleton<IEmpresasRepository>("EmpresasRepository", EmpresasRepository);
