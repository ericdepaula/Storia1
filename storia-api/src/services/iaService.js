import { gerarResposta as gerarRespostaOpenAI } from './ai_providers/openaiProvider.js';
import { gerarResposta as gerarRespostaGemini } from './ai_providers/geminiProvider.js';
import dotenv from 'dotenv';
dotenv.config();

// No futuro, faremos:
// import { gerarResposta as gerarRespostaGemini } from './ai_providers/geminiProvider.js';

/**
 * Esta é a função principal que o resto da aplicação vai chamar.
 * Ela funciona como um "distribuidor" que decide qual provedor de IA usar.
 * @param {string} prompt - O prompt para a IA.
 * @returns {Promise<object>} - A resposta da IA no nosso formato padrão.
 */
const gerarResposta = async (prompt) => {
    // O distribuidor olha para o nosso "interruptor principal" no .env
    const provedor = process.env.DEFAULT_AI_PROVIDER;

    console.log(`🤖 Usando o provedor de IA: ${provedor} modelo: ${process.env.GEMINI_MODEL}`);

    if (provedor === 'openai') {
        // Se a chave estiver em 'openai', ele chama o especialista da OpenAI.
        return gerarRespostaOpenAI(prompt);
    }

    if (provedor === 'gemini') {
        // Deixamos o espaço pronto para quando formos implementar o Gemini.
        return gerarRespostaGemini(prompt);
    }

    // Se o valor no .env for inválido, lançamos um erro.
    throw new Error(`Provedor de IA desconhecido: '${provedor}'. Verifique o arquivo .env.`);
};

export const iaService = {
    gerarResposta,
};