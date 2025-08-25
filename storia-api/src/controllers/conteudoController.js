import { conteudoService } from '../services/conteudoService.js';

/**
 * Lida com a requisição para VERIFICAR se o conteúdo gratuito já foi gerado.
 * (Seu código original, sem alterações)
 */
export const getStatusGratuito = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const jaGerou = await conteudoService.verificarStatusGratuito(usuarioId);
        res.status(200).json({ jaGerou });
    } catch (erro) {
        console.error("Erro no controller getStatusGratuito:", erro.message);
        res.status(500).json({ message: erro.message });
    }
};

/**
 * Lida com a requisição para GERAR o conteúdo gratuito.
 * (Seu código original, sem alterações)
 */
export const gerarGratis = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const promptData = req.body;
        const resultado = await conteudoService.gerarConteudoGratis(usuarioId, promptData);
        res.status(201).json(resultado);
    } catch (erro) {
        console.error("Erro no controller gerarGratis:", erro.message);
        res.status(erro.status || 500).json({ message: erro.message || 'Erro inesperado.' });
    }
};

/**
 * Lida com a requisição para OBTER TODOS os conteúdos de um usuário (prontos e pendentes).
 * (Seu código original, sem alterações, pois ele já faz a chamada correta)
 */
export const getConteudosDoUsuario = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        // Esta chamada agora aciona a nova lógica simplificada no serviço,
        // que por sua vez usa o mapper. O controller não precisa saber disso.
        const conteudos = await conteudoService.obterConteudosDoUsuario(usuarioId);

        res.status(200).json(conteudos);
    } catch (erro) {
        console.error("Erro no controller getConteudosDoUsuario:", erro.message);
        res.status(erro.status || 500).json({ message: erro.message });
    }
};

// --- GARANTINDO QUE TEMOS TODAS AS FUNÇÕES ---
// Se houver outras funções relacionadas a conteúdo que você precise, elas entrariam aqui.
// Por enquanto, estas são as 3 que definimos para o nosso fluxo.