import type { NextConfig } from "next";
import { API_URL } from "./src/config/env";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // packages/contracts é TypeScript do monorepo e é compilado junto com o app.
  transpilePackages: ["@startagio/contracts"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // O navegador só conversa com o Next; /api/* é repassado para a API Express.
  // Assim o cookie de sessão fica no mesmo domínio do site e não precisamos de CORS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
