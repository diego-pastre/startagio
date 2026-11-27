import { Router } from "express";
import { ensurePermissao } from "@shared/infra/http/middlewares/ensureAcesso";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { CandidaturasController } from "../controllers/CandidaturasController";

export const candidaturasController = new CandidaturasController();

export const candidaturasRoutes = Router();

candidaturasRoutes.use(ensureAuthenticated, ensurePermissao("pode_candidatar"));

candidaturasRoutes.get("/", candidaturasController.index);

/** PATCH /api/pontuacoes/:id/status: o nome da rota segue a seção 7 do PDF (tabela pontuacoes). */
export const pontuacoesRoutes = Router();

pontuacoesRoutes.use(ensureAuthenticated, ensurePermissao("pode_ver_candidatos"));

pontuacoesRoutes.patch("/:id/status", candidaturasController.alterarStatus);
