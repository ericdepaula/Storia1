import supabase from "../config/supabaseClient.js";
import { iaService } from "./iaService.js";
import { promptBuilderService } from "./promptBuilderService.js";
import { conteudoMapper } from "../mappers/conteudoMapper.js";
import { extrairJSON } from "../utils/jsonUtils.js";
import { planosDeProduto } from "../config/stripeConfig.js";
import { searchService } from "./searchService.js";

// ... (funções helper inalteradas)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function refinarTermosDeBusca(promptData) {
  console.log('🧠 (Conteúdo) ETAPA 1.1: Refinando termos de busca com a IA...');
  const promptDeRefinamento = `Analise os seguintes dados de um cliente: Setor: "${promptData.setor}", Tipo de Negócio: "${promptData.tipoNegocio}", Objetivo: "${promptData.objetivoPrincipal}". Sua tarefa é traduzir esses termos para categorias de mercado profissionais. Responda APENAS com um objeto JSON válido com a seguinte estrutura: { "setor": "string", "tipoNegocio": "string", "objetivoPrincipal": "string" }`;
  try {
    const resultadoIA = await iaService.gerarResposta(promptDeRefinamento);
    const jsonLimpo = extrairJSON(resultadoIA.resposta);
    const termosRefinados = JSON.parse(jsonLimpo);
    console.log('✅ (Conteúdo) ETAPA 1.2: Termos refinados com sucesso!');
    return { ...promptData, ...termosRefinados };
  } catch (error) {
    console.warn("⚠️ (Conteúdo) Falha ao refinar os termos de busca. Usando os termos originais.", error.message);
    return promptData;
  }
}

async function orquestrarGeracaoDeConteudo(promptData, duracaoTotalDias) {
  console.log(" оркестратор (Conteúdo) ETAPA 1: Iniciando orquestrador...");
  const termosRefinados = await refinarTermosDeBusca(promptData);

  console.log("🔍 (Conteúdo) ETAPA 2.1: Iniciando pesquisa de tendências...");
  const termoDeBusca = `estratégias de marketing de conteúdo para ${termosRefinados.tipoNegocio} com foco em ${termosRefinados.objetivoPrincipal}`;
  const contextoAtual = await searchService.pesquisarTendencias(termoDeBusca);
  console.log("✅ (Conteúdo) ETAPA 2.2: Pesquisa de tendências concluída.");

  let analiseEstrategicaFinal = {};
  let agendaDePostagensFinal = [];
  const diasPorLote = 7;

  console.log(`🤖 (Conteúdo) ETAPA 3.1: Iniciando geração de conteúdo principal para ${duracaoTotalDias} dias...`);
  for (let diaInicial = 1; diaInicial <= duracaoTotalDias; diaInicial += diasPorLote) {
    const diaFinal = Math.min(diaInicial + diasPorLote - 1, duracaoTotalDias);
    console.log(`(Conteúdo) Gerando lote de dias: ${diaInicial} a ${diaFinal}...`);
    const promptDoLote = promptBuilderService.construirPromptDeAgendaEstrategico(promptData, duracaoTotalDias, diaInicial, diaFinal, contextoAtual);
    const resultadoIA = await iaService.gerarResposta(promptDoLote);
    const conteudoLimpoJSON = extrairJSON(resultadoIA.resposta);
    const dadosDoLote = JSON.parse(conteudoLimpoJSON);

    if (diaInicial === 1 && dadosDoLote.analiseEstrategica) {
      analiseEstrategicaFinal = dadosDoLote.analiseEstrategica;
    }
    if (dadosDoLote.agendaDePostagens) {
      agendaDePostagensFinal.push(...dadosDoLote.agendaDePostagens);
    }
    if (diaFinal < duracaoTotalDias) await delay(1000);
  }

  const resultadoFinalCompleto = { analiseEstrategica: analiseEstrategicaFinal, agendaDePostagens: agendaDePostagensFinal };
  console.log(`✅ (Conteúdo) ETAPA 3.2: Geração de conteúdo principal concluída!`);
  return JSON.stringify(resultadoFinalCompleto);
}

// ... (funções verificarStatusGratuito e gerarConteudoGratis inalteradas)
const verificarStatusGratuito = async (usuarioId) => { /* ... */ };
const gerarConteudoGratis = async (usuarioId, promptData) => { /* ... */ };


const gerarConteudoPago = async (compra, promptData) => {
  console.log(`(Conteúdo) INÍCIO: Recebido pedido para gerar conteúdo pago da compra ${compra.id}.`);
  try {
    const planoComprado = planosDeProduto[compra.preco_id];
    if (!planoComprado) throw new Error(`Plano não encontrado para o preco_id: ${compra.preco_id}.`);
    
    console.log(`(Conteúdo) Plano encontrado: ${planoComprado.nome}. Chamando o orquestrador...`);
    const conteudoFinalParaSalvar = await orquestrarGeracaoDeConteudo(promptData, planoComprado.dias);

    console.log(`(Conteúdo) ETAPA 4.1: Orquestrador finalizou. Salvando resultado no Supabase...`);
    await supabase.from("conteudos_gerados").insert({
      usuario_id: compra.usuario_id,
      compra_id: compra.id,
      prompt_utilizado: "Prompt de plano pago (omitido para brevidade)",
      conteudo_gerado: conteudoFinalParaSalvar,
    });
    console.log(`✅ (Conteúdo) ETAPA 4.2: Conteúdo salvo na tabela 'conteudos_gerados'.`);

    await supabase.from("compras").update({ status_entrega: "ENTREGUE" }).eq("id", compra.id);
    console.log(`✅ (Conteúdo) FIM: Status da compra ${compra.id} atualizado para ENTREGUE.`);

  } catch (error) {
    console.error(`❌ (Conteúdo) FALHA CRÍTICA na geração de conteúdo pago para a Compra ID: ${compra.id}. Erro: ${error.message}`);
    await supabase.from("compras").update({ status_entrega: "ERRO_NA_GERACAO" }).eq("id", compra.id);
  }
};


const obterConteudosDoUsuario = async (usuarioId) => { /* ... */ };

export const conteudoService = {
  verificarStatusGratuito,
  gerarConteudoGratis,
  obterConteudosDoUsuario,
  gerarConteudoPago,
};