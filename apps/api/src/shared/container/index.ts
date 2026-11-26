import { container } from "tsyringe";
import "@modules/empresas/container";
import "@modules/usuarios/container";
import "@modules/vagas/container";
import { BcryptHashProvider } from "../providers/HashProvider/BcryptHashProvider";
import type { IHashProvider } from "../providers/HashProvider/IHashProvider";
import { JwtTokenProvider } from "../providers/TokenProvider/JwtTokenProvider";
import type { ITokenProvider } from "../providers/TokenProvider/ITokenProvider";

container.registerSingleton<IHashProvider>("HashProvider", BcryptHashProvider);
container.registerSingleton<ITokenProvider>("TokenProvider", JwtTokenProvider);
