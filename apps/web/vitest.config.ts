import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes das funções puras do front (src/utils). Componentes não são testados aqui.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
