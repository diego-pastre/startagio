import { env } from "@config/env";
import { app } from "./app";

app.listen(env.PORT, () => {
  console.log(`API do Startagio rodando em http://localhost:${env.PORT}/api`);
});
