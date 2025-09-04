import { Router } from 'express';
import { criarSessaoCheckout, criarCobrancaPix, listarProdutos } from '../controllers/pagamentoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router();

router.use(authMiddleware);

// Rota para checkout com STRIPE (Cartão)
// Endereço final: POST /api/pagamentos/checkout-stripe
router.post('/checkout-stripe', criarSessaoCheckout);

// Rota para checkout com ABACATEPAY (PIX)
// Endereço final: POST /api/pagamentos/checkout-pix
router.post('/checkout-pix', criarCobrancaPix)

// Rota para listar todos os produtos/planos disponíveis
// Endereço final: GET /api/pagamentos/produtos
router.get('/produtos', listarProdutos);

export default router;