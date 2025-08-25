import { Router } from 'express';
import { registrar, login, obterTodosUsuarios } from '../controllers/usuarioController.js';

const router = Router();

// ROTA DE CADASTRO
// Endereço final: POST /usuarios/cadastro
router.post('/cadastro', registrar);

// ROTA DE LOGIN
// Endereço final: POST /usuarios/login
router.post('/login', login);

// ROTA PARA LISTAR USUÁRIOS
// Endereço final: GET /usuarios
router.get('/', obterTodosUsuarios);


export default router;