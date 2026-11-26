import type { NivelAcesso, Permissoes } from "@startagio/contracts";
import type { ConflitoUsuarioDTO, CreateUsuarioDTO, UsuarioComAcessoDTO } from "../../dto/UsuarioDTO";
import type { IUsuariosRepository } from "../IUsuariosRepository";

// Mesma matriz da carga inicial de permissoes (migração init).
const PERMISSOES: Record<NivelAcesso, Permissoes> = {
  ESTUDANTE: { pode_criar_vagas: false, pode_candidatar: true, pode_ver_candidatos: false, pode_validar_estagio: false },
  EMPRESA: { pode_criar_vagas: true, pode_candidatar: false, pode_ver_candidatos: true, pode_validar_estagio: false },
  INSTITUICAO_ENSINO: { pode_criar_vagas: false, pode_candidatar: false, pode_ver_candidatos: false, pode_validar_estagio: true },
};

type UsuarioSalvo = CreateUsuarioDTO & { id: number };

export class FakeUsuariosRepository implements IUsuariosRepository {
  private usuarios: UsuarioSalvo[] = [];

  async create(data: CreateUsuarioDTO): Promise<UsuarioComAcessoDTO> {
    const usuario = { ...data, id: this.usuarios.length + 1 };
    this.usuarios.push(usuario);
    return this.comAcesso(usuario);
  }

  async findById(id: number): Promise<UsuarioComAcessoDTO | null> {
    const usuario = this.usuarios.find((item) => item.id === id);
    return usuario ? this.comAcesso(usuario) : null;
  }

  async findByLogin(login: string): Promise<UsuarioComAcessoDTO | null> {
    const usuario = this.usuarios.find((item) => item.usuario === login || item.email === login);
    return usuario ? this.comAcesso(usuario) : null;
  }

  async findConflitos({ usuario, email, cpf }: ConflitoUsuarioDTO): Promise<ConflitoUsuarioDTO[]> {
    return this.usuarios
      .filter((item) => item.usuario === usuario || item.email === email || item.cpf === cpf)
      .map((item) => ({ usuario: item.usuario, email: item.email, cpf: item.cpf }));
  }

  private comAcesso(usuario: UsuarioSalvo): UsuarioComAcessoDTO {
    return {
      id: usuario.id,
      usuario: usuario.usuario,
      senha: usuario.senha,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      cpf: usuario.cpf,
      nivel_acesso: usuario.nivel_acesso,
      permissoes: PERMISSOES[usuario.nivel_acesso],
      empresa: null,
    };
  }
}
