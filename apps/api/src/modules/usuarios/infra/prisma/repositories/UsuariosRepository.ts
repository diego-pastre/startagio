import { prisma } from "@shared/infra/prisma/client";
import type { Prisma } from "@shared/infra/prisma/models";
import type { ConflitoUsuarioDTO, CreateUsuarioDTO, UsuarioComAcessoDTO } from "../../../dto/UsuarioDTO";
import type { IUsuariosRepository } from "../../../repositories/IUsuariosRepository";

// Equivale ao INNER JOIN permissoes + LEFT JOIN empresas da query de login do PDF (seção 6.1).
const comAcesso = {
  permissao: true,
  empresa: { select: { id: true, nome_fantasia: true } },
} satisfies Prisma.UsuarioInclude;

type UsuarioComRelacoes = Prisma.UsuarioGetPayload<{ include: typeof comAcesso }>;

function toDTO({ permissao, ...usuario }: UsuarioComRelacoes): UsuarioComAcessoDTO {
  return {
    id: usuario.id,
    usuario: usuario.usuario,
    senha: usuario.senha,
    nome_completo: usuario.nome_completo,
    email: usuario.email,
    cpf: usuario.cpf,
    nivel_acesso: usuario.nivel_acesso,
    permissoes: {
      pode_criar_vagas: permissao.pode_criar_vagas,
      pode_candidatar: permissao.pode_candidatar,
      pode_ver_candidatos: permissao.pode_ver_candidatos,
      pode_validar_estagio: permissao.pode_validar_estagio,
    },
    empresa: usuario.empresa,
  };
}

export class UsuariosRepository implements IUsuariosRepository {
  async create(data: CreateUsuarioDTO): Promise<UsuarioComAcessoDTO> {
    const usuario = await prisma.usuario.create({ data, include: comAcesso });
    return toDTO(usuario);
  }

  async findById(id: number): Promise<UsuarioComAcessoDTO | null> {
    const usuario = await prisma.usuario.findUnique({ where: { id }, include: comAcesso });
    return usuario && toDTO(usuario);
  }

  async findByLogin(login: string): Promise<UsuarioComAcessoDTO | null> {
    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ usuario: login }, { email: login }] },
      include: comAcesso,
    });
    return usuario && toDTO(usuario);
  }

  async findConflitos({ usuario, email, cpf }: ConflitoUsuarioDTO): Promise<ConflitoUsuarioDTO[]> {
    return prisma.usuario.findMany({
      where: { OR: [{ usuario }, { email }, { cpf }] },
      select: { usuario: true, email: true, cpf: true },
    });
  }
}
