import { pagamentoService } from "../services/pagamentoService.js";

// Função para criar uma sessão de checkout
// Esta função é chamada pelo front-end quando o usuário deseja iniciar um pagamento.
export const criarSessaoCheckout = async (req, res) => {
  const { priceId, promptData, usuarioId } = req.body;

  if (!priceId || !promptData || !usuarioId) {
    return res
      .status(400)
      .json({ message: "priceId, promptData e usuarioId são obrigatórios." });
  }

  try {
    const resultado = await pagamentoService.criarSessaoDeCheckout(
      priceId,
      promptData,
      usuarioId
    );
    res.status(200).json(resultado);
  } catch (erro) {
    res
      .status(erro.status || 500)
      .json({ message: erro.message || "Ocorreu um problema inesperado." });
  }
};

// Função para listar todos os produtos disponíveis
// Esta função pode ser usada para exibir os produtos disponíveis para compra no front-end.
export const listarProdutos = async (req, res) => {
  try {
    const produtos = await pagamentoService.listarProdutos();
    res.status(200).json(produtos);
  } catch (erro) {
    res.status(erro.status || 500).json({
      message: erro.message || "Ocorreu um problema ao listar os produtos.",
    });
  }
};

