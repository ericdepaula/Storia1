import OpenAI from "openai";
import dotenv from "dotenv";
import { iaConfig } from "../../config/iaConfig.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Envia um prompt para a IA da OpenAI e retorna a resposta.
 * @param {string} prompt - A pergunta ou instrução do usuário.
 */
export const gerarResposta = async (prompt) => {
  if (!prompt) {
    throw { status: 400, message: "O prompt (pergunta) é obrigatório." };
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      // 2. Usamos os valores do nosso objeto de configuração importado.
      model: iaConfig.model,
      messages: [
        { role: "system", content: iaConfig.systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: iaConfig.temperature,
      max_tokens: iaConfig.maxTokens,
    });

    const respostaDaIA = chatCompletion.choices[0].message.content;

    return { resposta: respostaDaIA };
  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error.message);
    throw { status: 500, message: `Erro no serviço de IA: ${error.message}` };
  }
};