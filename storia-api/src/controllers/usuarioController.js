// Importamos o nosso novo serviço!
import { usuarioService } from "../services/usuarioService.js";


// REGISTRO DE USUÁRIO
export const registrar = async (req, res) => {
  try {
    const resultado = await usuarioService.cadastrarUsuario(req.body);
    // Devolve a resposta completa do serviço (que agora inclui o objeto do usuário)
    res.status(resultado.status).json(resultado);
  } catch (erro) {
    res.status(erro.status || 500).json({ message: erro.message || 'Ocorreu um problema inesperado.' });
  }
};

// LOGIN DE USUÁRIO
// Aqui, o usuário envia email e senha, e nós devolvemos um token JWT se tudo estiver certo.
export const login = async (req, res) => {
  try {
    const resultado = await usuarioService.autenticarUsuario(req.body);
    // Devolve a resposta completa do serviço (que agora inclui o token)
    res.status(resultado.status).json(resultado);
  } catch (erro) {
    res.status(erro.status || 500).json({ message: erro.message || 'Ocorreu um problema inesperado.' });
  }
};

// Se quisermos listar todos os usuários, podemos criar outra função aqui
export const obterTodosUsuarios = async (req, res) => {
  try {
    // 1. CHAME O ORGANIZADOR: Pede a lista completa de usuários.
    const usuarios = await usuarioService.listarTodosUsuarios();

    // 2. RESPONDA COM SUCESSO: Envia a lista de usuários de volta em formato JSON.
    // O status 200 (OK) é o padrão para requisições GET bem-sucedidas.
    res.status(200).json(usuarios);
  } catch (erro) {
    // Se o serviço der qualquer problema, caímos aqui.
    console.error("O controller recebeu um erro do serviço:", erro);
    res
      .status(erro.status || 500)
      .send(erro.message || "Ocorreu um problema inesperado.");
  }
};