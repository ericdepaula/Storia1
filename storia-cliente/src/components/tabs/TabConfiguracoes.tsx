import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import TimedSnackbar from '../TimedSnackbar';

const TabConfiguracoes: React.FC = () => {
  const { user, login } = useAuth();

  // Estado para os dados do formulário principal (sem a senha)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [agreeToChange, setAgreeToChange] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSubmitStatus, setPasswordSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estado para o formulário principal
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const applyPhoneMask = (value: string) => {
    if (!value) return "";
    // Remove tudo que não é dígito, limita a 11 caracteres e aplica a máscara
    value = value.replace(/\D/g, '').substring(0, 11);
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        telefone: applyPhoneMask(user.telefone || ''),
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setFormData((prev) => ({ ...prev, [name]: applyPhoneMask(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  // Novo handler para os inputs do modal
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para abrir e fechar o modal, resetando os estados
  const openPasswordModal = () => setIsModalOpen(true);
  const closePasswordModal = () => {
    setIsModalOpen(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setAgreeToChange(false);
    setPasswordSubmitStatus(null);
  };

  // Lógica de submit para os dados principais (nome e telefone)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setSubmitStatus({ type: 'error', message: 'Você não está autenticado.' });
      setIsLoading(false);
      return;
    }

    try {
      // Prepara os dados para envio, removendo a máscara do telefone
      const dadosParaEnviar = {
        ...formData,
        telefone: formData.telefone.replace(/\D/g, ''),
      };
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/usuarios/atualizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosParaEnviar),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar os dados.');
      }

      login(data.token, data.usuario);
      setSubmitStatus({ type: 'success', message: 'Dados atualizados com sucesso!' });
    } catch (error: any) {
      setSubmitStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para o submit da senha dentro do modal
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordSubmitStatus({ type: 'error', message: 'As senhas não coincidem.' });
      return;
    }
    if (!agreeToChange) {
      setPasswordSubmitStatus({ type: 'error', message: 'Você precisa concordar com a alteração.' });
      return;
    }

    setIsPasswordLoading(true);
    setPasswordSubmitStatus(null);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/usuarios/atualizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senha: passwordData.newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar a senha.');
      }
      
      setPasswordSubmitStatus({ type: 'success', message: 'Senha alterada com sucesso!' });
      setTimeout(() => closePasswordModal(), 2000); // Fecha o modal após 2 segundos

    } catch (error: any) {
        setPasswordSubmitStatus({ type: 'error', message: error.message });
    } finally {
        setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return <div>Carregando informações do usuário...</div>;
  }

  // Desabilita o botão de salvar do modal se as senhas não coincidirem,
  // se o campo estiver vazio ou se o checkbox não for marcado.
  const isPasswordSubmitDisabled = 
    isPasswordLoading ||
    !passwordData.newPassword ||
    passwordData.newPassword !== passwordData.confirmPassword ||
    !agreeToChange;

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações da Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="nome"
              id="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="text"
              name="telefone"
              id="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              maxLength={15} // (XX) XXXXX-XXXX
              placeholder="Não Preenchido"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Botão para abrir o modal de senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <button
                type="button"
                onClick={openPasswordModal}
                className="mt-1 w-full text-left py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
                Alterar Senha
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Snackbar para o formulário principal */}
      <TimedSnackbar status={submitStatus} onClose={() => setSubmitStatus(null)} />
      
      {/* Snackbar para o modal de senha */}
      <TimedSnackbar status={passwordSubmitStatus} onClose={() => setPasswordSubmitStatus(null)} />

      {/* Modal de Alteração de Senha */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
          onClick={closePasswordModal} // Fecha ao clicar fora
        >
          <div 
            className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative z-50"
            onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Alterar Senha</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToChange"
                      name="agreeToChange"
                      type="checkbox"
                      checked={agreeToChange}
                      onChange={(e) => setAgreeToChange(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToChange" className="font-medium text-gray-700">
                      Concordo com a alteração da minha senha
                    </label>
                  </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={closePasswordModal}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPasswordSubmitDisabled}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TabConfiguracoes;