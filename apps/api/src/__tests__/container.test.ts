import "@shared/container";
import { container } from "tsyringe";
import { describe, expect, it } from "vitest";
import { EmpresasRepository } from "@modules/empresas/infra/prisma/repositories/EmpresasRepository";
import { CreateEmpresaService } from "@modules/empresas/services/empresa/CreateEmpresaService";
import { UsuariosRepository } from "@modules/usuarios/infra/prisma/repositories/UsuariosRepository";
import { RegisterUsuarioService } from "@modules/usuarios/services/usuario/RegisterUsuarioService";
import { VagasRepository } from "@modules/vagas/infra/prisma/repositories/VagasRepository";
import { CreateVagaService } from "@modules/vagas/services/vaga/CreateVagaService";
import { CandidaturasRepository } from "@modules/candidaturas/infra/prisma/repositories/CandidaturasRepository";
import { ResponderProvaService } from "@modules/candidaturas/services/candidatura/ResponderProvaService";
import { PerfisEstudanteRepository } from "@modules/estudantes/infra/prisma/repositories/PerfisEstudanteRepository";
import { BcryptHashProvider } from "@shared/providers/HashProvider/BcryptHashProvider";

// Garante que os @inject("Token") dos services batem com o que está registrado no container.
describe("container de dependências", () => {
  it("monta os services com os repositórios e providers registrados", () => {
    const register = container.resolve(RegisterUsuarioService) as unknown as Record<string, unknown>;
    const createEmpresa = container.resolve(CreateEmpresaService) as unknown as Record<string, unknown>;

    expect(register.usuariosRepository).toBeInstanceOf(UsuariosRepository);
    expect(register.hashProvider).toBeInstanceOf(BcryptHashProvider);
    expect(createEmpresa.empresasRepository).toBeInstanceOf(EmpresasRepository);

    const createVaga = container.resolve(CreateVagaService) as unknown as Record<string, unknown>;
    expect(createVaga.vagasRepository).toBeInstanceOf(VagasRepository);

    const responder = container.resolve(ResponderProvaService) as unknown as Record<string, unknown>;
    expect(responder.vagasRepository).toBeInstanceOf(VagasRepository);
    expect(responder.candidaturasRepository).toBeInstanceOf(CandidaturasRepository);
    expect(responder.perfisRepository).toBeInstanceOf(PerfisEstudanteRepository);
  });
});
