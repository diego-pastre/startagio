import { container } from "tsyringe";
import { UsuariosRepository } from "../infra/prisma/repositories/UsuariosRepository";
import type { IUsuariosRepository } from "../repositories/IUsuariosRepository";

container.registerSingleton<IUsuariosRepository>("UsuariosRepository", UsuariosRepository);
