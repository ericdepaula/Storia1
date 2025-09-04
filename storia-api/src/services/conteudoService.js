import supabase from "../config/supabaseClient.js";
import { iaService } from "./iaService.js";
import { promptBuilderService } from "./promptBuilderService.js";
import { conteudoMapper } from "../mappers/conteudoMapper.js";
import { extrairJSON } from "../utils/jsonUtils.js";
import { planosDeProduto } from "../config/stripeConfig.js";
import { searchService } from "./searchService.js";

// --- FUNÇÕES HELPER ---

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizarJSON(jsonString) {
  try {
    const objeto = JSON.parse(jsonString);
    return JSON.stringify(objeto);
  } catch (e) {
    console.error("JSON extraído da IA é inválido:", e.message);
    throw new Error("A IA retornou um JSON malformado.");
  }
}

/**
 * Usa uma chamada rápida à IA para refinar termos genéricos do usuário
 * em palavras-chave profissionais e específicas para busca.
 * @param {object} promptData - Os dados brutos do formulário do usuário.
 * @returns {Promise<object>} - Um objeto com os termos refinados, ex: { setor, tipoNegocio, objetivoPrincipal }.
 */

async function refinarTermosDeBusca(promptData) {
  console.log('🧠 Refinando termos de busca com a IA...');

  const promptDeRefinamento = `
    Analise os seguintes dados de um cliente:
    - Setor: "${promptData.setor}"
    - Tipo de Negócio: "${promptData.tipoNegocio}"
    - Objetivo: "${promptData.objetivoPrincipal}"

    Sua tarefa é traduzir esses termos, que podem ser genéricos, para categorias de mercado profissionais e específicas que um especialista em marketing usaria para uma pesquisa de mercado.

    Responda APENAS com um objeto JSON válido com a seguinte estrutura:
    {
      "setor": "string",
      "tipoNegocio": "string",
      "objetivoPrincipal": "string"
    }
  `;

  try {
    const resultadoIA = await iaService.gerarResposta(promptDeRefinamento);
    const jsonLimpo = extrairJSON(resultadoIA.resposta);
    const termosRefinados = JSON.parse(jsonLimpo);

    console.log('✅ Termos refinados:', termosRefinados);
    // Retorna os dados originais, mas com os valores refinados pela IA
    return { ...promptData, ...termosRefinados };

  } catch (error) {
    console.warn("Falha ao refinar os termos de busca. Usando os termos originais.", error.message);
    // Em caso de falha, retornamos os dados originais para não quebrar o fluxo.
    return promptData;
  }
}

// --- FUNÇÃO ORQUESTRADORA DA "LINHA DE MONTAGEM" (ATUALIZADA) ---

const orquestrarGeracaoDeConteudo = async (promptData, duracaoTotalDias) => {
  // --- CHAMADA PARA REFINAR TERMOS DE BUSCA ---
  console.log("🔍 Refinando termos de busca...");
  const termosRefinados = await refinarTermosDeBusca(promptData);
  // const anoDePesquisa = new Date().getFullYear();
  console.log("🔍 Termos refinados para pesquisa:", termosRefinados);

  // --- ETAPA DE PESQUISA ACONTECE AQUI ---
  console.log("Iniciando pesquisa de tendências...");
  const termoDeBusca = `estratégias de marketing de conteúdo para ${termosRefinados.tipoNegocio} com foco em ${termosRefinados.objetivoPrincipal}`;
  const contextoAtual = await searchService.pesquisarTendencias(termoDeBusca);

  let analiseEstrategicaFinal = {};
  let agendaDePostagensFinal = [];
  const diasPorLote = 7;

  console.log(`Iniciando linha de montagem para ${duracaoTotalDias} dias...`);

  for (
    let diaInicial = 1;
    diaInicial <= duracaoTotalDias;
    diaInicial += diasPorLote
  ) {
    const diaFinal = Math.min(diaInicial + diasPorLote - 1, duracaoTotalDias);
    console.log(`Gerando lote: Dias ${diaInicial} a ${diaFinal}...`);

    const promptDoLote =
      promptBuilderService.construirPromptDeAgendaEstrategico(
        promptData,
        duracaoTotalDias,
        diaInicial,
        diaFinal,
        contextoAtual // Passamos os resultados da pesquisa para o prompt
      );

    const resultadoIA = await iaService.gerarResposta(promptDoLote);
    const conteudoLimpoJSON = extrairJSON(resultadoIA.resposta);
    const dadosDoLote = JSON.parse(conteudoLimpoJSON);

    if (diaInicial === 1 && dadosDoLote.analiseEstrategica) {
      analiseEstrategicaFinal = dadosDoLote.analiseEstrategica;
    }
    if (dadosDoLote.agendaDePostagens) {
      agendaDePostagensFinal.push(...dadosDoLote.agendaDePostagens);
    }
    if (diaFinal < duracaoTotalDias) {
      await delay(1000);
    }
  }

  const resultadoFinalCompleto = {
    analiseEstrategica: analiseEstrategicaFinal,
    agendaDePostagens: agendaDePostagensFinal,
  };

  console.log(
    `Linha de montagem concluída! ${agendaDePostagensFinal.length} dias gerados.`
  );
  return JSON.stringify(resultadoFinalCompleto);
}

// --- FUNÇÕES DE SERVIÇO PRINCIPAIS (sem alterações na lógica interna) ---

/**
 * Verifica no banco de dados se um usuário já gerou seu conteúdo gratuito.
 * @param {string} usuarioId - O ID do usuário a ser verificado.
 * @returns {Promise<boolean>} - Retorna 'true' se já gerou, 'false' se não.
 */
const verificarStatusGratuito = async (usuarioId) => {
  if (!usuarioId) {
    console.error("verificarStatusGratuito foi chamado sem um usuarioId.");
    throw new Error("ID do usuário é necessário para a verificação.");
  }
  // Consultamos a tabela de conteúdos gerados.
  const { data, error } = await supabase
    .from("conteudos_gerados")
    .select("id") // Só precisamos saber se existe, então 'id' é suficiente.
    .eq("usuario_id", usuarioId) // Filtra pelo usuário correto.
    .is("compra_id", null); // A "pista" mágica: o conteúdo gratuito não tem ID de compra.

  if (error) {
    console.error("Erro ao verificar status gratuito:", error.message);
    throw new Error(error.message);
  }

  return data && data.length > 0;
};

const gerarConteudoGratis = async (usuarioId, promptData) => {
  const jaGerou = await verificarStatusGratuito(usuarioId);
  if (jaGerou) {
    throw { status: 409, message: "O conteúdo de 5 dias já foi gerado." };
  }
  try {
    const conteudoFinalParaSalvar = await orquestrarGeracaoDeConteudo(
      promptData,
      5
    );

    const { error: insertError } = await supabase
      .from("conteudos_gerados")
      .insert({
        usuario_id: usuarioId,
        compra_id: null,
        prompt_utilizado: "Prompt de boas-vindas (omitido)",
        conteudo_gerado: conteudoFinalParaSalvar,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return { message: "Seu conteúdo gratuito foi gerado com sucesso!" };
  } catch (error) {
    // Se qualquer parte do 'try' falhar (orquestrador, IA, salvamento), caímos aqui.
    console.error(
      `❌ FALHA na geração de conteúdo gratuito para o Usuário ID: ${usuarioId}. Erro: ${error.message}`
    );
    // Lançamos um novo erro, mais genérico e seguro para o front-end.
    throw {
      status: 500,
      message:
        "Ocorreu um erro ao gerar seu conteúdo. Por favor, tente novamente mais tarde.",
    };
  }
};

const gerarConteudoPago = async (compra, promptData) => {
  try {
    const planoComprado = planosDeProduto[compra.preco_id];
    if (!planoComprado) throw new Error(`Plano não encontrado.`);

    // O orquestrador faz o trabalho pesado
    const conteudoFinalParaSalvar = await orquestrarGeracaoDeConteudo(
      promptData,
      planoComprado.dias
    );

    await supabase.from("conteudos_gerados").insert({
      usuario_id: compra.usuario_id,
      compra_id: compra.id,
      prompt_utilizado: "Prompt de plano pago (omitido)",
      conteudo_gerado: conteudoFinalParaSalvar,
    });

    await supabase
      .from("compras")
      .update({ status_entrega: "ENTREGUE" })
      .eq("id", compra.id);
    console.log(`✅ Conteúdo pago gerado para a Compra ID: ${compra.id}.`);
  } catch (error) {
    console.error(
      `❌ FALHA na geração de conteúdo pago para a Compra ID: ${compra.id}. Erro: ${error.message}`
    );
    await supabase
      .from("compras")
      .update({ status_entrega: "ERRO_NA_GERACAO" })
      .eq("id", compra.id);
  }
};

const obterConteudosDoUsuario = async (usuarioId) => {
  try {
    const { data: conteudosProntos, error: erroConteudos } = await supabase
      .from("conteudos_gerados")
      .select("*, compras(preco_id)")
      .eq("usuario_id", usuarioId);
    if (erroConteudos) throw new Error(erroConteudos.message);

    const { data: comprasPendentes, error: erroPendentes } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("status_entrega", "PENDENTE");
    if (erroPendentes) throw new Error(erroPendentes.message);

    const listaFinal = conteudoMapper.mapearListaDeConteudos(
      conteudosProntos || [],
      comprasPendentes || []
    );
    return listaFinal;
  } catch (err) {
    console.error("Erro no serviço ao obter conteúdos:", err.message);
    throw { status: 500, message: "Erro ao buscar seus conteúdos." };
  }
};

export const conteudoService = {
  verificarStatusGratuito,
  gerarConteudoGratis,
  obterConteudosDoUsuario,
  gerarConteudoPago,
};
