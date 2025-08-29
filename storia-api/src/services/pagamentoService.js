import Stripe from "stripe";
import dotenv from "dotenv";
import { planosDeProduto } from "../config/stripeConfig.js";
import supabase from "../config/supabaseClient.js"; // 1. IMPORTE O SUPABASE CLIENT

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const criarSessaoDeCheckout = async (priceId, promptData, usuarioId) => {
  if (!priceId || !usuarioId) {
    throw { status: 400, message: "priceId e usuarioId são obrigatórios." };
  }

  try {
    // 2. BUSQUE O EMAIL DO USUÁRIO NO BANCO DE DADOS
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("email")
      .eq("id", usuarioId)
      .single();

    if (usuarioError) {
      throw { status: 500, message: "Usuário não encontrado." };
    }
    // --- FIM DA BUSCA ---

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      // 3. ADICIONE O EMAIL DO CLIENTE AQUI
      customer_email: usuario.email,
      // ---
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
    throw {
      status: error.status || 500,
      message: `Erro no serviço da Stripe: ${error.message}`,
    };
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
  listarProdutos,
};