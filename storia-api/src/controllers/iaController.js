import { iaService } from "../services/iaService.js";

export const perguntarAoAssistente = async (req, res) => {
  // A pergunta do usuário virá no corpo da requisição.
  const { prompt } = req.body;

  try {
    const resultado = await iaService.gerarResposta(prompt);
    res.status(200).json(resultado); // Devolve a resposta da IA.
  } catch (erro) {
    res
      .status(erro.status || 500)
      .json({ message: erro.message || "Ocorreu um problema inesperado." });
  }
};
