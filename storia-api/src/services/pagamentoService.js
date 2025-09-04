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
    const { data: usuario } = await supabase.from("usuarios").select("nome, email").eq("id", usuarioId).single();
    if (!usuario) throw { status: 500, message: "Usuário não encontrado." };

    const plano = planosDeProduto[priceId];
    if (!plano || typeof plano.precoEmCentavos === 'undefined') {
      throw { status: 404, message: "Plano ou preço não encontrado na configuração." };
    }

    const billingData = {
      customer: {
        name: usuario.nome,
        email: usuario.email,
        cellphone: (usuario.telefone || '00000000000').replace(/\D/g, ''),
        taxId,
      },
      amount: plano.precoEmCentavos,
      description: `Pagamento para: ${plano.nome}`,
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: priceId,
          name: plano.nome,
          quantity: 1,
          price: plano.precoEmCentavos
        }
      ],
      returnUrl: `${frontendUrl}/dashboard`,
      completionUrl: `${frontendUrl}/dashboard`,
      metadata: { ...promptData, usuarioId, priceId },
    };

    console.log(`🥑 Criando cobrança PIX no valor de ${plano.precoEmCentavos / 100} para ${usuario.email}...`);
    const respostaApi = await abacatePay.billing.create(billingData);
    const novaCobranca = respostaApi.data;
    console.log("--- DEBUG: Resposta da API AbacatePay ---");
    console.log(JSON.stringify(novaCobranca, null, 2));

    if (!novaCobranca || !novaCobranca.url) {
      console.log("Resposta inesperada da AbacatePay:", respostaApi);
      throw new Error('Falha ao obter os dados de pagamento da AbacatePay.');
    }

    return {
      paymentUrl: novaCobranca.url
    };

  } catch (error) {
    if (error.response) {
      console.error("Erro detalhado da API AbacatePay:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Erro ao criar cobrança PIX na AbacatePay:", error.message);
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