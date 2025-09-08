import Stripe from "stripe";
import AbacatePayModule from "abacatepay-nodejs-sdk";
import dotenv from "dotenv";
import { planosDeProduto } from "../config/stripeConfig.js";
import supabase from "../config/supabaseClient.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const abacatePay = new AbacatePayModule.default(process.env.ABACATE_PAY_API_KEY);

const criarSessaoDeCheckout = async (priceId, promptData, usuarioId) => {
  if (!priceId || !usuarioId) {
    throw { status: 400, message: "priceId e usuarioId são obrigatórios." };
  }
  try {
    const { data: usuario } = await supabase.from("usuarios").select("email").eq("id", usuarioId).single();
    if (!usuario) throw { status: 500, message: "Usuário não encontrado." };
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer_email: usuario.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      ui_mode: 'embedded',
      return_url: `${frontendUrl}/dashboard`,
      client_reference_id: usuarioId,
      metadata: promptData,
    });
    return { clientSecret: session.client_secret };
  } catch (error) {
    console.error("Erro ao criar sessão de checkout na Stripe:", error.message);
    throw { status: error.status || 500, message: `Erro no serviço da Stripe: ${error.message}` };
  }
};


const criarCobrancaPix = async (priceId, promptData, usuarioId, taxId) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!priceId || !usuarioId) {
    throw { status: 400, message: "priceId e usuarioId são obrigatórios." };
  }

  try {
    const { data: usuario } = await supabase.from("usuarios").select("nome, email, telefone").eq("id", usuarioId).single();
    if (!usuario) throw { status: 500, message: "Usuário não encontrado." };

    const plano = planosDeProduto[priceId];
    if (!plano) throw { status: 404, message: "Plano não encontrado." };

    const billingData = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: priceId,
          name: plano.nome,
          description: `Pagamento para: ${plano.nome}`,
          quantity: 1,
          price: plano.precoEmCentavos,
        }
      ],
      returnUrl: `${frontendUrl}/dashboard`,
      completionUrl: `${frontendUrl}/dashboard`,
      customer: {
        name: usuario.nome,
        cellphone: (usuario.telefone || '00000000000').replace(/\D/g, ''),
        email: usuario.email,
        taxId,
      },
    };

    console.log(`🥑 Criando cobrança PIX no valor de ${plano.precoEmCentavos / 100} para ${usuario.email}...`);
    const novaCobranca = await abacatePay.billing.create(billingData);

    console.log("--- DEBUG: Resposta da API AbacatePay ---");
    console.log(JSON.stringify(novaCobranca, null, 2));

    const abacateData = novaCobranca.data

    if (!abacateData.id || !abacateData.url) {
      console.error("Resposta inválida da AbacatePay:\n", JSON.stringify(abacateData, null, 2));
      throw new Error('Falha ao criar a cobrança na AbacatePay.');
    }

    console.log(`📝 Registrando intenção de compra para a cobrança ${abacateData.id}...`);
    const { error: insertError } = await supabase.from("compras").insert({
      usuario_id: usuarioId,
      payment_session_id: abacateData.id,
      produto_id: abacateData.products[0].id,
      preco_id: priceId,
      valor_total: plano.precoEmCentavos / 100,
      status_pagamento: "PENDENTE",
      status_entrega: "",
      informacao_conteudo: promptData,
    });

    if (insertError) {
      console.error("Erro ao salvar a intenção de compra:", insertError);
      throw new Error(`Não foi possível registrar a compra: ${insertError.message}`);
    }

    return {
      paymentUrl: abacateData.url,
    };

  } catch (error) {
    if (error.response) {
      console.error("Erro detalhado da API AbacatePay:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Erro em criarCobrancaPix:", error.message);
    }
    throw { status: 500, message: `Erro no serviço da AbacatePay: ${error.message}` };
  }
};


const listarProdutos = async () => {
  try {
    return Object.values(planosDeProduto);
  } catch (error) {
    console.error("Erro ao listar produtos:", error.message);
    throw { status: 500, message: "Erro ao listar produtos." };
  }
};

export const pagamentoService = {
  criarSessaoDeCheckout,
  criarCobrancaPix,
  listarProdutos,
};