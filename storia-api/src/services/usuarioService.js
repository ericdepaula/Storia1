import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Importa a biblioteca JWT

const cadastrarUsuario = async (userData) => {
  const { nome, email, telefone, senha } = userData;
  if (!email || !senha || !nome || !telefone) {
    throw { status: 400, message: 'Nome, email, telefone e senha são obrigatórios.' };
  }


  const senhaHash = await bcrypt.hash(senha, parseInt(process.env.PASSWORD_SALT_ROUNDS));

  const { data: novoUsuario, error: insertError } = await supabase
    .from('usuarios')
    .insert({ nome, email, telefone, senha: senhaHash })
    .select() // Pede para o Supabase retornar o registro criado
    .single(); // Pega esse único registro como um objeto

  if (insertError) {
    if (insertError.code === '23505') { // Código de erro para violação de unicidade
      throw { status: 409, message: 'Este email já está em uso.' };
    }
    throw { status: 500, message: `Erro ao criar usuário: ${insertError.message}` };
  }

  return { status: 201, message: 'Usuário cadastrado com sucesso!', usuario: novoUsuario };
};

const autenticarUsuario = async (credentials) => {
  const { email, senha } = credentials;
  if (!email || !senha) {
    throw { status: 400, message: 'Email e senha são obrigatórios.' };
  }

  const { data: usuario, error: buscaError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (buscaError || !usuario) {
    throw { status: 401, message: 'Email ou senha inválidos.' };
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    throw { status: 401, message: 'Email ou senha inválidos.' };
  }

  // Cria o "crachá digital" (JWT)
  const payload = { id: usuario.id, email: usuario.email, nome: usuario.nome };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

  await supabase.from('usuarios').update({ ultimo_acesso: new Date().toISOString() }).eq('id', usuario.id);

  // Retorna o token e os dados do usuário para o front-end
  return {
    status: 200,
    message: 'Login bem-sucedido!',
    token: token,
    usuario: payload,
  };
};

// Função para listar todos os usuários
const listarTodosUsuarios = async () => {
  try {
    const { data, error } = await supabase.from("usuarios").select("*");

    // Se o Supabase retornar um erro, nós o lançamos para o controller tratar.
    if (error) {
      console.error("Erro no serviço ao listar usuários:", error);
      throw { status: 500, message: "Erro ao buscar a lista de usuários." };
    }

    // Se tudo der certo, retornamos os dados (a lista de usuários).
    return data;
  } catch (error) {
    // Re-lança o erro para que o controller o capture.
    throw error;
  }
};


export const usuarioService = {
  cadastrarUsuario,
  autenticarUsuario,
  listarTodosUsuarios,
};