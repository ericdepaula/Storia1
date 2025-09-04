import express from "express";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import pagamentoRoutes from "./src/routes/pagamentoRoutes.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import iaRoutes from "./src/routes/iaRoutes.js";
import conteudoRoutes from "./src/routes/conteudoRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js"
import cors from "cors";

const app = express();
app.use(cors());

app.use("/webhooks", webhookRoutes);

// Middleware para processar JSON no corpo das outras requisições.
app.use(express.json());
// Middleware para processar dados de formulários (application/x-www-form-urlencoded).
app.use(express.urlencoded({ extended: true }));

// Registro das rotas da nossa API.
app.use("/api/health", healthRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/ia", iaRoutes);
app.use("/conteudo", conteudoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🎉 Servidor rodando na porta ${PORT}`);
});