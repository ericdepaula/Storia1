import Stripe from "stripe";
import dotenv from "dotenv";
import supabase from "../config/supabaseClient.js";
// A ÚNICA importação de serviço que precisamos agora é a do 'conteudoService'.
import { conteudoService } from "./conteudoService.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Processa os eventos do webhook da Stripe.
 * Sua única responsabilidade é validar o evento, registrar a compra
 * e delegar a geração de conteúdo para o serviço especialista.
 */
const processarWebhook = async (body, sig) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Assinatura do Webhook inválida: ${err.message}`);
    throw { status: 400, message: `Webhook Error: ${err.message}` };
  }

  // Focamos apenas no evento que confirma o pagamento.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(`🔔 Pagamento confirmado. Sessão ID: ${session.id}`);

    // Verificamos se a compra já foi processada para evitar duplicatas.
    const { data: compraExistente } = await supabase
      .from('compras')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single();

    if (compraExistente) {
      console.warn(`Webhook para a sessão ${session.id} já foi processado. Ignorando.`);
      return; // Para a execução para evitar duplicatas.
    }

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      if (lineItems.data.length === 0) throw new Error("Sessão sem produtos.");

      // --- ETAPA 1: REGISTRO DA "COMANDA" ---
      console.log(`💾 Registrando a compra para o usuário ${session.client_reference_id}...`);
      const { data: novaCompra, error: compraError } = await supabase
        .from("compras")
        .insert({
          usuario_id: session.client_reference_id,
          stripe_session_id: session.id,
          produto_id: lineItems.data[0].price.product,
          preco_id: lineItems.data[0].price.id,
          valor_total: session.amount_total / 100,
          status_pagamento: session.payment_status,
          status_entrega: "PENDENTE", // Status inicial
        })
        .select()
        .single();

      if (compraError) {
        throw new Error(`Erro CRÍTICO ao salvar a compra: ${compraError.message}`);
      }
      console.log(`🛒 Compra ${novaCompra.id} registrada com sucesso com status PENDENTE.`);

      // --- ETAPA 2: DELEGAÇÃO PARA O "CHEF" ---
      // Chamamos o especialista em conteúdo para fazer o trabalho pesado.
      // Passamos o registro da compra e os dados do formulário.
      await conteudoService.gerarConteudoPago(novaCompra, session.metadata);

    } catch (err) {
      console.error(`====== ❌ ERRO GERAL NO PROCESSAMENTO DO WEBHOOK ======`);
      console.error(`Sessão da Stripe ID: ${session.id}. Erro: ${err.message}`);
      // Em um sistema de produção, você poderia enviar um alerta para um administrador aqui.
    }
  }
};

export const webhookService = {
  processarWebhook,
};