import { Router } from 'express';
import express from 'express'; // Precisamos do express aqui para a configuração especial
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = Router();

// Rota especial para receber eventos da Stripe.
// A mágica está em 'express.raw({ type: 'application/json' })', que diz
// ao Express para nos dar o corpo da requisição sem processá-lo como JSON.
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;