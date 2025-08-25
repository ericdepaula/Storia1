import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone, AlertCircle } from 'lucide-react';
import TimedSnackbar from '../components/TimedSnackbar';

interface FormData {
  fullName: string;
  email: string;
  telefone: string;
  agreeToPrivacy: boolean;
}

interface Errors {
  fullName?: string;
  email?: string;
  telefone?: string;
  // A senha continua aqui para exibirmos os erros
  password?: string;
  confirmPassword?: string;
  agreeToPrivacy?: string;
}

interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "", email: "", telefone: "", agreeToPrivacy: false,
  });
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" });
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password: string) => {
    const rules = [
      { test: (pwd: string) => pwd.length >= 8 },
      { test: (pwd: string) => /[a-z]/.test(pwd) },
      { test: (pwd: string) => /[A-Z]/.test(pwd) },
      { test: (pwd: string) => /[0-9]/.test(pwd) },
      { test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
    ];

    const feedbacks = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];

    const score = rules.reduce((acc, rule) => acc + (rule.test(password) ? 1 : 0), 0);

    return {
      score,
      feedback: feedbacks[score - 1] || "Muito fraca",
    };
  };

  const getPasswordStrengthColor = (score: number) => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    return colors[Math.min(score - 1, colors.length - 1)];
  };

  const getPasswordStrengthWidth = (score: number, max = 5) => {
    return `${(score / max) * 100}%`;
  };

  // Validação em tempo real para os campos controlados
  const validateField = (name: keyof FormData, value: string | boolean) => {
    const newErrors = { ...errors };

    switch (name) {
      case "fullName":
        if (typeof value === "string" && !value.trim()) {
          newErrors.fullName = "Nome é obrigatório";
        } else if (typeof value === "string" && value.trim().length < 2) {
          newErrors.fullName = "Nome deve ter pelo menos 2 caracteres";
        } else {
          delete newErrors.fullName;
        }
        break;
      case "email":
        if (typeof value === "string" && !value) {
          newErrors.email = "Email é obrigatório";
        } else if (typeof value === "string" && !validateEmail(value)) {
          newErrors.email = "Por favor, insira um email válido";
        } else {
          delete newErrors.email;
        }
        break;
      case "telefone":
        if (typeof value === "string" && !value.trim()) {
          newErrors.telefone = "Telefone é obrigatório";
        } else {
          delete newErrors.telefone;
        }
        break;
      case "agreeToPrivacy":
        if (!value) {
          newErrors.agreeToPrivacy = "Você deve concordar com a política de privacidade";
        } else {
          delete newErrors.agreeToPrivacy;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue: string | boolean = type === "checkbox" ? checked : value;


    // As senhas não estão mais no estado, então não precisamos lidar com elas aqui.
    if (name !== 'password' && name !== 'confirmPassword') {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      validateField(name as keyof FormData, newValue);
    }

    if (submitStatus) {
      setSubmitStatus(null);
    }

  };

  // Esta função será chamada pelo `onChange` do input de senha.
  const handlePasswordChange = () => {
    const password = passwordRef.current?.value || '';
    setPasswordStrength(calculatePasswordStrength(password));
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);

    // --- Captura valores das senhas a partir das refs ---
    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';

    // Validação completa antes do envio
    const newErrors: Errors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!validateEmail(formData.email)) newErrors.email = "Por favor, insira um email válido";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    if (!password) newErrors.password = "Senha é obrigatória";
    else if (password.length < 5) newErrors.password = "Senha deve ter pelo menos 5 caracteres";
    if (password !== confirmPassword) newErrors.confirmPassword = "As senhas não correspondem";
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = "Você deve concordar com a política de privacidade";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({ type: 'error', message: 'Por favor, corrija todos os campos inválidos.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/usuarios/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.fullName,
          email: formData.email,
          telefone: formData.telefone,
          senha: password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ocorreu um erro ao criar a conta.");

      setSubmitStatus({ type: "success", message: "Conta criada com sucesso! Redirecionando ao login..." });
      setTimeout(() => navigate("/signin"), 2000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setSubmitStatus({ type: "error", message: errorMessage });
    } finally {
      if (passwordRef.current) passwordRef.current.value = "";
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
          <p className="text-gray-600">Se cadastre e aproveite nossos serviços</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input de Nome */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="Insira seu nome e sobrenome"
                />
              </div>
              {errors.fullName && (<p id="fullName-error" className="mt-2 text-sm text-red-600 flex items-center"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.fullName} </p>)}
            </div>
            {/* Input de Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Endereço de Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="Insira seu email"
                />
              </div>
              {errors.email && (<p id="email-error" className="mt-2 text-sm text-red-600 flex items-center"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.email} </p>)}
            </div>

            {/* Input de Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  maxLength={15}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefone ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="(12) 12345-6789"
                />
              </div>
              {errors.telefone && (<p className="text-sm text-red-600 flex items-center mt-2"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.telefone} </p>)}
            </div>

            {/* --- Input de Senha não controlado --- */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2"> Senha </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  ref={passwordRef} // Usar a ref
                  onChange={handlePasswordChange} // Chamar a nova função para a barra de força
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="Insira sua senha"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"} > {showPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)} </button>
              </div>

              {/* O `onChange` no input de senha irá atualizar este estado */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Força da Senha:</span>
                  <span className={`text-sm font-medium ${passwordStrength.score <= 1 ? "text-red-600" : passwordStrength.score <= 2 ? "text-orange-600" : passwordStrength.score <= 3 ? "text-yellow-600" : passwordStrength.score <= 4 ? "text-blue-600" : "text-green-600"}`}> {passwordStrength.feedback} </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`} style={{ width: getPasswordStrengthWidth(passwordStrength.score) }} />
                </div>
              </div>

              {errors.password && (<p id="password-error" className="mt-2 text-sm text-red-600 flex items-center"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.password} </p>)}
            </div>

            {/* --- Input de Confirmar Senha não controlado --- */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2"> Confirme sua Senha </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  ref={confirmPasswordRef} // Usar a ref
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="Confirme sua senha"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label={showConfirmPassword ? "Hide password" : "Show password"}> {showConfirmPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)} </button>
              </div>
              {errors.confirmPassword && (<p id="confirmPassword-error" className="mt-2 text-sm text-red-600 flex items-center"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.confirmPassword} </p>)}
            </div>

            {/* Checkbox de Termos */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToPrivacy"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToPrivacy" className="ml-3 text-sm text-gray-700"> Eu concordo com a{" "} <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline"> Politica de Privacidade </Link> </label>
              </div>
              {errors.agreeToPrivacy && (<p className="text-sm text-red-600 flex items-center ml-7"> <AlertCircle className="h-4 w-4 mr-1" /> {errors.agreeToPrivacy} </p>)}
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center" > {isLoading ? (<><Loader2 className="animate-spin h-5 w-5 mr-2" /> Criando conta...</>) : "Criar Conta"} </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Já possui uma conta?{" "}<Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">Entrar</Link></p>
          </div>
        </div>
      </div>

      {/** Snackbar para exibir mensagens de sucesso ou erro */}
      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />
    </div>
  );
};

export default SignUp;