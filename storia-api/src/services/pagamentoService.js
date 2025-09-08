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
    if (!plano) {
      throw { status: 404, message: "Plano não encontrado." };
    }

    const billingData = {
      customer: {
        name: usuario.nome,
        email: usuario.email,
        cellphone: (usuario.telefone || '00000000000').replace(/\D/g, ''),
        taxId,
      },
      amount: plano.precoEmCentavos,
      products: [{ externalId: priceId, name: plano.nome, quantity: 1, price: plano.precoEmCentavos }],
      returnUrl: `${frontendUrl}/dashboard`,
    };

    console.log(`🥑 Criando cobrança PIX para ${usuario.email}...`);
    const respostaApi = await abacatePay.billing.create(billingData);
    const novaCobranca = respostaApi.data;

    if (!novaCobranca || !novaCobranca.id) {
      throw new Error('Falha ao criar a cobrança na AbacatePay.');
    }

    // 2. Salve a INTENÇÃO de compra no seu banco de dados IMEDIATAMENTE.
    // Adicione uma nova coluna 'prompt_data' (tipo JSONB) na sua tabela 'compras'.
    console.log(`📝 Registrando intenção de compra para a cobrança ${novaCobranca.id}...`);
    const { error: insertError } = await supabase.from("compras").insert({
      usuario_id: usuarioId,
      payment_session_id: novaCobranca.id, // Usamos o ID da AbacatePay para vincular
      preco_id: priceId,
      valor_total: plano.precoEmCentavos / 100,
      status_pagamento: "PENDENTE", // Começa como pendente
      status_entrega: "PENDENTE",
      prompt_data: promptData, // Salva os dados do formulário aqui
    });

    if (insertError) {
      console.error("Erro ao salvar a intenção de compra:", insertError);
      throw new Error(`Não foi possível registrar a compra: ${insertError.message}`);
    }

    // 3. Retorne a URL de pagamento para o frontend
    return {
      paymentUrl: novaCobranca.url
    };

  } catch (error) {
    console.error("Erro em criarCobrancaPix:", error.message);
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