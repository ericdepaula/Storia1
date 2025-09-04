import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook, handleAbacatePayWebhook } from '../controllers/webhookController.js';

const router = Router();

// Rota para o webhook da Stripe
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Rota para o webhook da AbacatePay
router.post('/abacatepay', express.raw({ type: 'application/json' }), handleAbacatePayWebhook);

export default router;