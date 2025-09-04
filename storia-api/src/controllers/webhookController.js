import { webhookService } from "../services/webhookService.js";

// --- CONTROLLER PARA STRIPE ---
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const rawBody = req.body;

    // Chama o serviço específico do Stripe
    await webhookService.processarWebhookStripe(rawBody, sig);

    res.status(200).json({ received: true });
  } catch (erro) {
    console.error("Erro no controller do webhook Stripe:", erro.message);
    res.status(erro.status || 400).json({ error: erro.message });
  }
};

// --- CONTROLLER PARA ABACATEPAY ---
export const handleAbacatePayWebhook = async (req, res) => {
  try {
    const sig = req.headers["abacate-signature"];
    const rawBody = req.body;

    // Chama o serviço específico da AbacatePay
    await webhookService.processarWebhookAbacatePay(rawBody, sig);

    res.status(200).json({ received: true });
  } catch (erro) {
    console.error("Erro no controller do webhook AbacatePay:", erro.message);
    res.status(erro.status || 400).json({ error: erro.message });
  }
};