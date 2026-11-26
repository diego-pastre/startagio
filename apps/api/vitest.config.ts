import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (pasta: string) => fileURLToPath(new URL(`./src/${pasta}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@config": src("config"),
      "@modules": src("modules"),
      "@shared": src("shared"),
    },
  },
  test: {
    setupFiles: ["reflect-metadata"],
    // Valores só para os testes: nenhum teste abre conexão com o banco.
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "mysql://teste:teste@localhost:3306/teste",
      JWT_SECRET: "segredo-de-teste-com-mais-de-32-caracteres",
    },
  },
});
