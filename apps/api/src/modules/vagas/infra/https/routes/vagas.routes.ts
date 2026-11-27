import { Router } from "express";
import { candidaturasController } from "@modules/candidaturas/infra/https/routes/candidaturas.routes";
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
vagasRoutes.put("/:id", ensurePermissao("pode_criar_vagas"), vagasController.update);
vagasRoutes.get("/:id/formulario", ensurePermissao("pode_criar_vagas"), vagasController.formulario);
vagasRoutes.get("/:id/candidatos", ensurePermissao("pode_ver_candidatos"), candidaturasController.candidatos);
// Prova e candidatura (seção 7 do PDF). O código fica no módulo candidaturas.
vagasRoutes.get("/:id/questionario", ensurePermissao("pode_candidatar"), candidaturasController.prova);
vagasRoutes.post("/:id/responder", ensurePermissao("pode_candidatar"), candidaturasController.responder);
vagasRoutes.patch("/:id/status", ensurePermissao("pode_criar_vagas"), vagasController.updateStatus);
vagasRoutes.delete("/:id", ensurePermissao("pode_criar_vagas"), vagasController.encerrar);
