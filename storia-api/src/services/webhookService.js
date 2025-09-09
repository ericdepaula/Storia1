import Stripe from "stripe";
import AbacatePayModule from "abacatepay-nodejs-sdk";
import dotenv from "dotenv";
import supabase from "../config/supabaseClient.js";
import { conteudoService } from "./conteudoService.js";
import { planosDeProduto } from "../config/stripeConfig.js";

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
      const billingId = billingData.id;
      console.log(`🔔 (Webhook) Pagamento PIX confirmado para a cobrança ID: ${billingId}`);

      // 1. Verificação de Idempotência: Evita processar o mesmo webhook duas vezes.
      const { data: compraExistente } = await supabase
        .from('compras')
        .select('id')
        .eq('payment_session_id', billingId)
        .single();

      if (compraExistente) {
        console.warn(`(Webhook) Cobrança AbacatePay ${billingId} já foi processada. Ignorando.`);
        return;
      }

      // 2. Extrair dados do payload do webhook, incluindo os metadados que enviamos.
      const metadata = billingData.metadata;
      // Agora verificamos as chaves individuais que esperamos.
      if (!metadata || !metadata.usuarioId || !metadata.setor || !metadata.tipoNegocio || !metadata.objetivoPrincipal) {
        throw new Error(`Webhook AbacatePay ${billingId} não contém metadados essenciais (usuarioId e dados do prompt).`);
      }
      const usuarioId = metadata.usuarioId;
      // Reconstruímos o objeto promptData a partir dos metadados recebidos.
      const promptData = {
        setor: metadata.setor,
        tipoNegocio: metadata.tipoNegocio,
        objetivoPrincipal: metadata.objetivoPrincipal,
      };
      const priceId = billingData.products[0].externalId;
      const plano = planosDeProduto[priceId];
      if (!plano) {
        throw new Error(`Plano com priceId ${priceId} não encontrado na configuração.`);
      }

      // 3. Criar o registro da compra no banco de dados.
      const { data: novaCompra, error: compraError } = await supabase
        .from("compras")
        .insert({
          usuario_id: usuarioId,
          payment_session_id: billingId,
          produto_id: plano.produtoId,
          preco_id: priceId,
          valor_total: billingData.value / 100,
          status_pagamento: "paid",
          status_entrega: "PENDENTE",
          informacao_conteudo: promptData,
        })
        .select()
        .single();

      if (compraError) throw new Error(`Erro CRÍTICO ao salvar a compra AbacatePay: ${compraError.message}`);

      console.log(`🛒 Compra AbacatePay (PIX) ${novaCompra.id} registrada com sucesso.`);
      await conteudoService.gerarConteudoPago(novaCompra, promptData);
    } else {
      console.log(`(Webhook) Evento "${eventType}" com status "${billingData.status}" ignorado.`);
    }
  } catch (err) {
    console.error(`====== ❌ ERRO NO PROCESSAMENTO GERAL DO WEBHOOK ABACATEPAY ======`);
    console.error(`Erro: ${err.message}`);
  }
};

export const webhookService = {
  processarWebhookStripe,
  processarWebhookAbacatePay,
};