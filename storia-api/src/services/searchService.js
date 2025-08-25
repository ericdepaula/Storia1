import axios from 'axios';

/**
 * Pesquisa no Google por um termo e retorna um resumo dos principais resultados.
 * @param {string} termoDeBusca - O que queremos pesquisar.
 * @returns {Promise<string>} - Uma string formatada com o resumo dos resultados da pesquisa.
 */
const pesquisarTendencias = async (termoDeBusca) => {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY; 
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.warn("Chaves da API do Google não configuradas. A pesquisa será pulada.");
    return "Pesquisa em tempo real não pôde ser realizada.";
  }
  
  const url = 'https://www.googleapis.com/customsearch/v1';

  const params = {
    key: apiKey,
    cx: searchEngineId,
    q: termoDeBusca,
    num: 3, // 3 para um contexto mais focado e rápido
    sort: 'date', // Ordena por data para obter os resultados mais recentes
  };

  try {
    console.log(`🔎 Realizando pesquisa por: "${termoDeBusca}"...`);
    const response = await axios.get(url, { params });

    if (!response.data.items || response.data.items.length === 0) {
      return "Nenhum resultado relevante encontrado na pesquisa em tempo real.";
    }

    const resumoDosResultados = response.data.items.map((item, index) => {
      return `Fonte ${index + 1}: "${item.title}"\nResumo: ${item.snippet}`;
    }).join('\n\n');

    console.log("✅ Pesquisa concluída com sucesso.");
    return resumoDosResultados;

  } catch (error) {
    console.error("❌ Erro ao chamar a API de Pesquisa do Google:", error.response?.data?.error?.message || error.message);
    return "Houve um erro ao realizar a pesquisa em tempo real.";
  }
};

export const searchService = {
  pesquisarTendencias,
};