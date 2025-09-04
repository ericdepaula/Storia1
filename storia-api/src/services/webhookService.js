import Stripe from "stripe";
import AbacatePayModule from "abacatepay-nodejs-sdk";
import dotenv from "dotenv";
import supabase from "../config/supabaseClient.js";
import { conteudoService } from "./conteudoService.js";

dotenv.config();
// ... (código de inicialização inalterado)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const AbacatePay = AbacatePayModule.default;
const abacatePay = new AbacatePay(process.env.ABACATE_PAY_API_KEY);
const abacatePayWebhookSecret = process.env.ABACATE_PAY_WEBHOOK_SECRET;

const processarWebhookStripe = async (body, sig) => {
  // ... (código do webhook stripe inalterado)
};

const processarWebhookAbacatePay = async (body, sig) => {
  let event;
  try {
    event = AbacatePay.webhooks.constructEvent(body, sig, abacatePayWebhookSecret);
  } catch (err) {
    console.error(`❌ Assinatura do Webhook AbacatePay inválida: ${err.message}`);
    throw { status: 400, message: `Webhook Error: ${err.message}` };
  }

  if (event.type === "billing.paid") {
    const billing = event.data;
    console.log(`🔔 (Webhook) Pagamento PIX confirmado para a cobrança ID: ${billing.id}`);

    const { data: compraExistente } = await supabase.from('compras').select('id').eq('abacate_billing_id', billing.id).single();

    if (compraExistente) {
      console.warn(`(Webhook) Cobrança ${billing.id} já foi processada. Ignorando.`);
      return;
    }

    try {
      const { usuarioId, priceId, ...promptData } = billing.metadata;
      if (!usuarioId || !priceId) {
        throw new Error("Webhook da AbacatePay sem 'usuarioId' ou 'priceId' nos metadados.");
      }

      console.log(`(Webhook) Registrando a compra no banco de dados para o usuário ${usuarioId}...`);
      const { data: novaCompra, error: compraError } = await supabase.from("compras").insert({
          usuario_id: usuarioId,
          abacate_billing_id: billing.id,
          preco_id: priceId,
          valor_total: billing.amount / 100,
          status_pagamento: "paid",
          status_entrega: "PENDENTE",
        }).select().single();

      if (compraError) {
        throw new Error(`Erro CRÍTICO ao salvar a compra PIX: ${compraError.message}`);
      }
      console.log(`(Webhook) Compra ${novaCompra.id} registrada com sucesso.`);

      // --- PONTO CRÍTICO ---
      console.log(`(Webhook) Chamando o serviço de geração de conteúdo...`);
      await conteudoService.gerarConteudoPago(novaCompra, promptData);
      console.log(`(Webhook) Serviço de geração de conteúdo finalizado para a compra ${novaCompra.id}.`);
      // --------------------

    } catch (err) {
      console.error(`====== ❌ ERRO GERAL NO PROCESSAMENTO DO WEBHOOK ABACATEPAY ======`);
      console.error(`Cobrança ID: ${billing.id}. Erro: ${err.message}`);
    }
  }
};

export const webhookService = {
  processarWebhookStripe,
  processarWebhookAbacatePay,
};