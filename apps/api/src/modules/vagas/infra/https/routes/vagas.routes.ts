import { Router } from "express";
import { ensurePermissao } from "@shared/infra/http/middlewares/ensureAcesso";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { VagasController } from "../controllers/VagasController";

const vagasController = new VagasController();

export const vagasRoutes = Router();

vagasRoutes.use(ensureAuthenticated);

// Rotas fixas antes de "/:id", senão "minhas" e "filtros" seriam lidos como id.
vagasRoutes.get("/", vagasController.index);
vagasRoutes.get("/filtros", vagasController.filtros);
vagasRoutes.get("/minhas", ensurePermissao("pode_criar_vagas"), vagasController.minhas);
vagasRoutes.post("/", ensurePermissao("pode_criar_vagas"), vagasController.create);

vagasRoutes.get("/:id", vagasController.show);
vagasRoutes.patch("/:id/status", ensurePermissao("pode_criar_vagas"), vagasController.updateStatus);
vagasRoutes.delete("/:id", ensurePermissao("pode_criar_vagas"), vagasController.encerrar);
