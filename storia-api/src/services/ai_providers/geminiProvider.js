import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a chave de API do Gemini do nosso arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configura o modelo que vamos usar
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

/**
 * Função especialista em gerar respostas usando a API do Google Gemini.
 * Note que ela tem o mesmo "formato" da função do openaiProvider.
 * @param {string} prompt - O prompt para a IA.
 * @returns {Promise<object>} - A resposta da IA no nosso formato padrão { resposta: "..." }.
 */
const gerarResposta = async (prompt) => {
  if (!prompt) {
    throw new Error("O prompt é obrigatório.");
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    return { resposta: text };
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    // Lançamos um erro para que o controller possa capturá-lo.
    throw new Error(`Erro no provedor Gemini: ${error.message}`);
  }
};

export { gerarResposta };
