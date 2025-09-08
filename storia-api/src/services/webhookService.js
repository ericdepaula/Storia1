import Stripe from "stripe";
import AbacatePayModule from "abacatepay-nodejs-sdk";
import dotenv from "dotenv";
import supabase from "../config/supabaseClient.js";
import { conteudoService } from "./conteudoService.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const abacatePay = new AbacatePayModule.default(process.env.ABACATE_PAY_API_KEY);
const abacatePayWebhookSecret = process.env.ABACATE_PAY_WEBHOOK_SECRET;

const processarWebhookStripe = async (body, sig) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error(`❌ Assinatura do Webhook Stripe inválida: ${err.message}`);
    throw { status: 400, message: `Webhook Error: ${err.message}` };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { data: compraExistente } = await supabase.from('compras').select('id').eq('payment_session_id', session.id).single();
    if (compraExistente) {
      console.warn(`Webhook Stripe para a sessão ${session.id} já foi processado. Ignorando.`);
      return;
    }
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      if (lineItems.data.length === 0) throw new Error("Sessão Stripe sem produtos.");
      const { data: novaCompra, error: compraError } = await supabase.from("compras").insert({
        usuario_id: session.client_reference_id,
        payment_session_id: session.id,
        produto_id: lineItems.data[0].price.product,
        preco_id: lineItems.data[0].price.id,
        valor_total: session.amount_total / 100,
        status_pagamento: "paid",
        status_entrega: "PENDENTE",
      }).select().single();
      if (compraError) throw new Error(`Erro CRÍTICO ao salvar a compra Stripe: ${compraError.message}`);
      console.log(`🛒 Compra Stripe ${novaCompra.id} registrada com sucesso.`);
      await conteudoService.gerarConteudoPago(novaCompra, session.metadata);
    } catch (err) {
      console.error(`====== ❌ ERRO GERAL NO PROCESSAMENTO DO WEBHOOK STRIPE ======`);
      console.error(`Sessão ID: ${session.id}. Erro: ${err.message}`);
    }
  }
};

const processarWebhookAbacatePay = async (body, sig) => {
  try {
    const eventPayload = JSON.parse(body.toString('utf-8'));
    const eventType = eventPayload.event;
    const billingData = eventPayload.data.billing;

    if (eventType === 'billing.paid' && billingData.status === 'PAID') {
      console.log(`🔔 (Webhook) Pagamento PIX confirmado para a cobrança ID: ${billingData.id}`);

      const { data: compraExistente } = await supabase.from('compras').select('id').eq('payment_session_id', billingData.id).single();
      if (compraExistente) {
        console.warn(`(Webhook) Cobrança ${billingData.id} já foi processada. Ignorando.`);
        return;
      }

      // --- CORREÇÃO PRINCIPAL: BUSCAR OS DETALHES DA COBRANÇA ---
      // O webhook não contém os metadados, então buscamos a cobrança direto na API.
      console.log(`(Webhook) Buscando detalhes da cobrança ${billingData.id} na AbacatePay...`);
      const respostaApi = await abacatePay.billing.get(billingData.id);
      const fullBillingData = respostaApi.data;
      const promptData = fullBillingData.metadata;

      if (!promptData || !promptData.usuarioId) {
        throw new Error("Metadata (promptData) ou usuarioId não encontrado na cobrança da AbacatePay.");
      }

      const usuarioId = promptData.usuarioId;
      // --- FIM DA CORREÇÃO ---

      console.log(`(Webhook) Registrando a compra no banco de dados para o usuário ${usuarioId}...`);

      // --- CORREÇÃO SECUNDÁRIA: ACESSO AO PRECO_ID ---
      // O 'products' é um array, então acessamos o primeiro item.
      const precoId = billingData.products && billingData.products.length > 0
        ? billingData.products[0].externalId
        : promptData.priceId; // Fallback para o metadata se necessário

      if (!precoId) {
        throw new Error("preco_id não encontrado no webhook da AbacatePay.");
      }
      // --- FIM DA CORREÇÃO ---

      const { data: novaCompra, error: compraError } = await supabase.from("compras").insert({
        usuario_id: usuarioId, // Agora usamos o ID correto
        payment_session_id: billingData.id,
        preco_id: precoId,
        valor_total: billingData.amount / 100,
        status_pagamento: "paid",
        status_entrega: "PENDENTE",
      }).select().single();

      if (compraError) throw new Error(`Erro CRÍTICO ao salvar a compra PIX: ${compraError.message}`);

      console.log(`🛒 Compra PIX ${novaCompra.id} registrada com sucesso.`);

      console.log(`(Webhook) Chamando o serviço de geração de conteúdo...`);
      await conteudoService.gerarConteudoPago(novaCompra, promptData);
      console.log(`(Webhook) Serviço de geração de conteúdo finalizado para a compra ${novaCompra.id}.`);

    } else {
      console.log(`(Webhook) Evento com status "${eventType}" recebido e ignorado conforme as regras.`);
    }

  } catch (err) {
    console.error(`====== ❌ ERRO NO PROCESSAMENTO GERAL DO WEBHOOK ABACATEPAY ======`);
    console.error(`Erro: ${err.message}`);
    console.error("Corpo bruto que causou o erro:", body.toString('utf-8'));
  }
};


export const webhookService = {
  processarWebhookStripe,
  processarWebhookAbacatePay,
};