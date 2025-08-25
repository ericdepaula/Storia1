import { webhookService } from "../services/webhookService.js";

export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"]; // A assinatura enviada pela Stripe
    const rawBody = req.body; // O corpo bruto que a rota nos passou

    // Passa a assinatura e o corpo bruto para o serviço tratar
    await webhookService.processarWebhook(rawBody, sig);

    // Se tudo deu certo, respondemos à Stripe com um status 200 OK.
    res.status(200).json({ received: true });
  } catch (erro) {
    // Se algo der errado, informamos a Stripe.
    console.error("Erro no controller do webhook:", erro.message);
    res.status(erro.status || 400).json({ error: erro.message });
  }
};