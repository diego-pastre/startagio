import { Router } from "express";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { limitarTentativasDeLogin } from "@shared/infra/http/middlewares/limitarTentativasDeLogin";
import { AuthController } from "../controllers/AuthController";

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", limitarTentativasDeLogin, authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", ensureAuthenticated, authController.me);
