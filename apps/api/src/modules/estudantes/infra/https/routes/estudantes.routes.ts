import { Router } from "express";
import { ensureNivelAcesso } from "@shared/infra/http/middlewares/ensureAcesso";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { PerfisEstudanteController } from "../controllers/PerfisEstudanteController";

const perfisController = new PerfisEstudanteController();

export const estudantesRoutes = Router();

estudantesRoutes.use(ensureAuthenticated, ensureNivelAcesso("ESTUDANTE"));

estudantesRoutes.get("/perfil", perfisController.show);
estudantesRoutes.put("/perfil", perfisController.save);
