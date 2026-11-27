import type { Request, Response } from "express";
import { container } from "tsyringe";
import { perfilEstudanteSchema } from "@startagio/contracts";
import { usuarioDaRequisicao } from "@shared/infra/http/sessao";
import { FindPerfilEstudanteService } from "../../../services/perfil/FindPerfilEstudanteService";
import { SavePerfilEstudanteService } from "../../../services/perfil/SavePerfilEstudanteService";

// O usuario_id sempre vem da sessão, nunca do corpo da requisição.
export class PerfisEstudanteController {
  async show(req: Request, res: Response): Promise<void> {
    res.json(await container.resolve(FindPerfilEstudanteService).execute(usuarioDaRequisicao(req).id));
  }

  async save(req: Request, res: Response): Promise<void> {
    const dados = perfilEstudanteSchema.parse(req.body);
    res.json(await container.resolve(SavePerfilEstudanteService).execute(usuarioDaRequisicao(req).id, dados));
  }
}
