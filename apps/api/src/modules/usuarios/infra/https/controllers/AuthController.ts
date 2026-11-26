import type { Request, Response } from "express";
import { container } from "tsyringe";
import { cadastroUsuarioSchema, loginSchema } from "@startagio/contracts";
import { definirCookieSessao, limparCookieSessao, usuarioDaRequisicao } from "@shared/infra/http/sessao";
import { AuthenticateUsuarioService } from "../../../services/usuario/AuthenticateUsuarioService";
import { RegisterUsuarioService } from "../../../services/usuario/RegisterUsuarioService";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const dados = cadastroUsuarioSchema.parse(req.body);
    const { usuario, token } = await container.resolve(RegisterUsuarioService).execute(dados);
    definirCookieSessao(res, token);
    res.status(201).json(usuario);
  }

  async login(req: Request, res: Response): Promise<void> {
    const dados = loginSchema.parse(req.body);
    const { usuario, token } = await container.resolve(AuthenticateUsuarioService).execute(dados);
    definirCookieSessao(res, token);
    res.json(usuario);
  }

  async logout(_req: Request, res: Response): Promise<void> {
    limparCookieSessao(res);
    res.status(204).send();
  }

  async me(req: Request, res: Response): Promise<void> {
    res.json(usuarioDaRequisicao(req));
  }
}
