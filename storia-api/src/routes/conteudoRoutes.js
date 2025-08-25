import { Router } from 'express';
import {
    getStatusGratuito,
    gerarGratis,
    getConteudosDoUsuario
} from '../controllers/conteudoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

// Endereço final: GET /conteudo/status-gratuito
router.get('/status-gratuito', getStatusGratuito);

// Endereço final: POST /conteudo/gerar-gratis
router.post('/gerar-gratis', gerarGratis);

// Endereço final: GET /conteudo
router.get('/', getConteudosDoUsuario);


export default router;