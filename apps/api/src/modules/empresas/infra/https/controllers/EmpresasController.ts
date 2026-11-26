import type { Request, Response } from "express";
import { container } from "tsyringe";
import { empresaSchema } from "@startagio/contracts";
import { usuarioDaRequisicao } from "@shared/infra/http/sessao";
import { CreateEmpresaService } from "../../../services/empresa/CreateEmpresaService";
import { FindEmpresaByUsuarioService } from "../../../services/empresa/FindEmpresaByUsuarioService";
import { UpdateEmpresaService } from "../../../services/empresa/UpdateEmpresaService";

// O usuario_id sempre vem da sessão, nunca do corpo da requisição (seção 3.4 do PDF).
export class EmpresasController {
  async show(req: Request, res: Response): Promise<void> {
    const empresa = await container.resolve(FindEmpresaByUsuarioService).execute(usuarioDaRequisicao(req).id);
    res.json(empresa);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dados = empresaSchema.parse(req.body);
    const empresa = await container.resolve(CreateEmpresaService).execute(usuarioDaRequisicao(req).id, dados);
    res.status(201).json(empresa);
  }

  async update(req: Request, res: Response): Promise<void> {
    const dados = empresaSchema.parse(req.body);
    const empresa = await container.resolve(UpdateEmpresaService).execute(usuarioDaRequisicao(req).id, dados);
    res.json(empresa);
  }
}
