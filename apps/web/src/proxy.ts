import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO } from "@startagio/contracts/constantes";

// Checagem rápida: sem cookie de sessão, nem renderiza a área logada.
// A checagem de verdade (token válido e perfil certo) é feita nos layouts, via GET /api/auth/me.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(COOKIE_SESSAO)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/estudante/:path*", "/empresa/:path*", "/instituicao/:path*"],
};
