import type { UsuarioAutenticado } from "@startagio/contracts";

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware ensureAuthenticated. */
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
