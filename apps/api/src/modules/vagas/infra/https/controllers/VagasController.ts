import type { Request, Response } from "express";
import { container } from "tsyringe";
import {
  alterarStatusVagaSchema,
  editarVagaSchema,
  filtrosMinhasVagasSchema,
  filtrosVagasSchema,
  novaVagaSchema,
} from "@startagio/contracts";
import { idDaRota } from "@shared/infra/http/parametros";
import { usuarioDaRequisicao } from "@shared/infra/http/sessao";
import { CreateVagaService } from "../../../services/vaga/CreateVagaService";
import { FindFormularioVagaService } from "../../../services/vaga/FindFormularioVagaService";
import { FindVagaService } from "../../../services/vaga/FindVagaService";
import { ListOpcoesFiltroVagasService } from "../../../services/vaga/ListOpcoesFiltroVagasService";
import { ListVagasAbertasService } from "../../../services/vaga/ListVagasAbertasService";
import { ListVagasDaEmpresaService } from "../../../services/vaga/ListVagasDaEmpresaService";
import { UpdateStatusVagaService } from "../../../services/vaga/UpdateStatusVagaService";
import { UpdateVagaService } from "../../../services/vaga/UpdateVagaService";

const VAGA_NAO_ENCONTRADA = "Vaga não encontrada.";

export class VagasController {
  async index(req: Request, res: Response): Promise<void> {
    const filtros = filtrosVagasSchema.parse(req.query);
    res.json(await container.resolve(ListVagasAbertasService).execute(filtros));
  }

  async filtros(_req: Request, res: Response): Promise<void> {
    res.json(await container.resolve(ListOpcoesFiltroVagasService).execute());
  }

  async minhas(req: Request, res: Response): Promise<void> {
    const filtros = filtrosMinhasVagasSchema.parse(req.query);
    res.json(await container.resolve(ListVagasDaEmpresaService).execute(usuarioDaRequisicao(req), filtros));
  }

  async create(req: Request, res: Response): Promise<void> {
    const dados = novaVagaSchema.parse(req.body);
    const vaga = await container.resolve(CreateVagaService).execute(usuarioDaRequisicao(req), dados);
    res.status(201).json(vaga);
  }

  async show(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    res.json(await container.resolve(FindVagaService).execute(usuarioDaRequisicao(req), id));
  }

  async formulario(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    res.json(await container.resolve(FindFormularioVagaService).execute(usuarioDaRequisicao(req), id));
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    const dados = editarVagaSchema.parse(req.body);
    res.json(await container.resolve(UpdateVagaService).execute(usuarioDaRequisicao(req), id, dados));
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    const { status } = alterarStatusVagaSchema.parse(req.body);
    res.json(await container.resolve(UpdateStatusVagaService).execute(usuarioDaRequisicao(req), id, status));
  }

  /** DELETE /api/vagas/:id: exclusão lógica (status Encerrada), como a seção 6.4 do PDF recomenda. */
  async encerrar(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req, VAGA_NAO_ENCONTRADA);
    await container.resolve(UpdateStatusVagaService).execute(usuarioDaRequisicao(req), id, "ENCERRADA");
    res.status(204).send();
  }
}
