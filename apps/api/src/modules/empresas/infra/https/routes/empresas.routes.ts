import { Router } from "express";
import { ensureNivelAcesso } from "@shared/infra/http/middlewares/ensureAcesso";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { EmpresasController } from "../controllers/EmpresasController";

const empresasController = new EmpresasController();

export const empresasRoutes = Router();

empresasRoutes.use(ensureAuthenticated, ensureNivelAcesso("EMPRESA"));

empresasRoutes.get("/me", empresasController.show);
empresasRoutes.post("/", empresasController.create);
empresasRoutes.put("/me", empresasController.update);
