import type { Request, Response } from "express";
import { container } from "tsyringe";
import {
  alterarStatusCandidaturaSchema,
  filtrosCandidatosSchema,
  filtrosCandidaturasSchema,
  responderProvaSchema,
} from "@startagio/contracts";
import { idDaRota } from "@shared/infra/http/parametros";
import { usuarioDaRequisicao } from "@shared/infra/http/sessao";
import { ListCandidaturasService } from "../../../services/candidatura/ListCandidaturasService";
import { ResponderProvaService } from "../../../services/candidatura/ResponderProvaService";
import { FindProvaService } from "../../../services/prova/FindProvaService";
import { ListCandidatosService } from "../../../services/ranking/ListCandidatosService";
import { UpdateStatusCandidaturaService } from "../../../services/ranking/UpdateStatusCandidaturaService";

const VAGA_NAO_ENCONTRADA = "Vaga não encontrada.";

export class CandidaturasController {
  /** GET /api/vagas/:id/questionario */
  async prova(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    res.json(await container.resolve(FindProvaService).execute(usuarioDaRequisicao(req), id));
  }

  /** POST /api/vagas/:id/responder */
  async responder(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    const dados = responderProvaSchema.parse(req.body);
    const candidatura = await container.resolve(ResponderProvaService).execute(usuarioDaRequisicao(req), id, dados);
    res.status(201).json(candidatura);
  }

  /** GET /api/vagas/:id/candidatos */
  async candidatos(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    const filtros = filtrosCandidatosSchema.parse(req.query);
    res.json(await container.resolve(ListCandidatosService).execute(usuarioDaRequisicao(req), id, filtros));
  }

  /** PATCH /api/pontuacoes/:id/status */
  async alterarStatus(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, "Candidatura não encontrada.");
    const { status } = alterarStatusCandidaturaSchema.parse(req.body);
    res.json(await container.resolve(UpdateStatusCandidaturaService).execute(usuarioDaRequisicao(req), id, status));
  }

  /** GET /api/candidaturas */
  async index(req: Request, res: Response): Promise<void> {
    const filtros = filtrosCandidaturasSchema.parse(req.query);
    res.json(await container.resolve(ListCandidaturasService).execute(usuarioDaRequisicao(req), filtros));
  }
}
