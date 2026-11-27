import { Router } from "express";
import { candidaturasRoutes, pontuacoesRoutes } from "@modules/candidaturas/infra/https/routes/candidaturas.routes";
import { empresasRoutes } from "@modules/empresas/infra/https/routes/empresas.routes";
import { estudantesRoutes } from "@modules/estudantes/infra/https/routes/estudantes.routes";
import { authRoutes } from "@modules/usuarios/infra/https/routes/auth.routes";
import { vagasRoutes } from "@modules/vagas/infra/https/routes/vagas.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/auth", authRoutes);
routes.use("/empresas", empresasRoutes);
routes.use("/vagas", vagasRoutes);
routes.use("/estudantes", estudantesRoutes);
routes.use("/candidaturas", candidaturasRoutes);
routes.use("/pontuacoes", pontuacoesRoutes);
