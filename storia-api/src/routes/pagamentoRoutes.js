import { Router } from 'express';
import { criarSessaoCheckout, listarProdutos } from '../controllers/pagamentoController.js';

const router = Router();

// Rota para o front-end solicitar a criação de um pagamento
// Endereço final: POST /pagamentos/checkout
router.post('/checkout', criarSessaoCheckout);

// Rota para listar todos os produtos disponíveis
// Endereço final: GET api/pagamentos/produtos
// Esta rota pode ser usada para exibir os produtos disponíveis para compra
router.get('/produtos', listarProdutos);

// Rota para a página de sucesso do pagamento
// Endereço final: GET /pagamentos/sucesso-pagamento
// Esta rota serve para exibir uma página de sucesso após o pagamento
router.get('/sucesso-pagamento', (req, res) => {
  res.sendFile('sucesso-pagamento.html', { root: 'public' });
});

export default router;