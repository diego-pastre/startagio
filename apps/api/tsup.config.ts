import { defineConfig } from "tsup";

export default defineConfig({
  entry: { server: "src/shared/infra/http/server.ts" },
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // O pacote de contratos é TypeScript do próprio monorepo: entra no bundle em vez de ser importado em runtime.
  noExternal: ["@startagio/contracts"],
});
