import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import TimedSnackbar from '../components/TimedSnackbar';

// --- Tipos para os dados do formulário e estados ---
interface FormData {
  email: string;
}
interface Errors {
  email?: string;
  password?: string;
}
interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}

// Função para validar o email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Componente SignIn
const SignIn = () => {
  const [formData, setFormData] = useState<FormData>({ email: '' });
  // --- MELHORIA 1: Usar useRef para a senha ---
  // A ref nos dará acesso direto ao input sem precisar de um estado.
  const passwordRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const navigate = useNavigate();

  // A validação agora foca no que está no estado (apenas o email)
  const validate = useCallback((data: FormData) => {
    const newErrors: Errors = {};
    if (data.email && !validateEmail(data.email)) {
      newErrors.email = 'Por favor, insira um email válido';
    }
    return newErrors;
  }, []);

  useEffect(() => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
  }, [formData, validate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // O input de senha não vai mais chamar esta função
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- MELHORIA 2: Capturar a senha diretamente da ref ---
    const passwordToSend = passwordRef.current?.value || '';

    const finalErrors = validate(formData);
    if (!formData.email) finalErrors.email = 'Email é obrigatório';
    if (!passwordToSend) finalErrors.password = 'Senha é obrigatória';

    setErrors(finalErrors);

    if (Object.keys(finalErrors).length > 0) {
      setSubmitStatus({ type: 'error', message: 'Por favor, corrija os campos em vermelho.' });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/usuarios/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, senha: passwordToSend }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Credenciais inválidas.');
      }
      localStorage.setItem('authToken', data.token);

      if (data.usuario) {
        localStorage.setItem('userInfo', JSON.stringify(data.usuario));
      }
      setSubmitStatus({ type: 'success', message: 'Login realizado com sucesso! Redirecionando...' });

      // Limpa o campo de senha manualmente após o sucesso
      if (passwordRef.current) {
        passwordRef.current.value = '';
      }

      navigate('/dashboard');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      setSubmitStatus({ type: 'error', message: errorMessage });
      // Limpa o campo de senha manualmente em caso de erro
      if (passwordRef.current) {
        passwordRef.current.value = '';
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem vindo!</h1>
          <p className="text-gray-600">Entre com sua conta para continuar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Informe seu email"
                  autoComplete="email"
                />
              </div>
              {errors.email && (<p id="email-error" className="mt-2 text-sm text-red-600 flex items-center"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.email} </p>)}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                {/* --- MELHORIA 3: Remover 'value' e 'onChange', adicionar 'ref' --- */}
                <input
                  type={showPassword ? 'text' : 'password'} id="password" name="password"
                  ref={passwordRef}
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Informe sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (<p id="password-error" className="mt-2 text-sm text-red-600 flex items-center"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.password} </p>)}

            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (<><Loader2 className="animate-spin h-5 w-5 mr-2" /></>) : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />
    </div>
  );
};

export default SignIn;