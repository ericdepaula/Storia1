import { Router } from "express";
import { perguntarAoAssistente } from "../controllers/iaController.js";

const router = Router();

// Usamos POST porque o usuário está ENVIANDO dados (o prompt).
router.post("/perguntar", perguntarAoAssistente);

router.get("/", (req, res) => {
  res.send("Rota IA funcionando! Use POST /ia/perguntar para interagir com o assistente.");
});

export default router;
