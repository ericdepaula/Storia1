import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import TimedSnackbar from "../components/TimedSnackbar";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext"; // Importação correta

// --- Tipos para os dados do formulário e estados ---
interface FormData {
  email: string;
}
interface Errors {
  email?: string;
  password?: string;
}
interface SubmitStatus {
  type: "success" | "error";
  message: string;
}

// Função para validar o email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Componente SignIn
const SignIn = () => {
  const [formData, setFormData] = useState<FormData>({ email: "" });
  const passwordRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

  const { login } = useAuth(); // Pegamos a função 'login' do nosso contexto
  const navigate = useNavigate();

  // A validação agora foca no que está no estado (apenas o email)
  const validate = useCallback((data: FormData) => {
    const newErrors: Errors = {};
    if (data.email && !validateEmail(data.email)) {
      newErrors.email = "Por favor, insira um email válido";
    }
    return newErrors;
  }, []);

  // ---> INÍCIO DA MUDANÇA PRINCIPAL (LOGIN COM GOOGLE) <---
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/usuarios/auth/google/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session }),
          }
        )
          .then((res) => {
            if (!res.ok) {
              return res.json().then((err) => {
                throw new Error(
                  err.message || "Falha na comunicação com a API"
                );
              });
            }
            return res.json();
          })
          .then((data) => {
            if (data.token && data.usuario) {
              // 1. CHAME A FUNÇÃO DO CONTEXTO
              login(data.token, data.usuario);

              // 2. NAVEGUE PARA O DASHBOARD
              navigate("/dashboard");
            } else {
              console.error(
                "API não retornou um token ou usuário válido.",
                data
              );
              setSubmitStatus({
                type: "error",
                message: "Falha ao obter dados de autenticação.",
              });
            }
          })
          .catch((error) => {
            console.error("Erro durante o callback do Google:", error);
            setSubmitStatus({ type: "error", message: error.message });
          })
          .finally(() => setIsLoading(false));
      }
    });
    return () => subscription.unsubscribe();
    // Adicione 'login' e 'navigate' às dependências do useEffect
  }, [login, navigate]);
  // ---> FIM DA MUDANÇA PRINCIPAL (LOGIN COM GOOGLE) <---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  // ---> INÍCIO DA MUDANÇA (LOGIN COM EMAIL/SENHA) <---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordToSend = passwordRef.current?.value || "";
    const finalErrors = validate(formData);
    if (!formData.email) finalErrors.email = "Email é obrigatório";
    if (!passwordToSend) finalErrors.password = "Senha é obrigatória";

    setErrors(finalErrors);
    if (Object.keys(finalErrors).length > 0) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, corrija os campos em vermelho.",
      });
      return;
    }
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/usuarios/login`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, senha: passwordToSend }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas.");
      }

      if (data.token && data.usuario) {
        // 1. CHAME A FUNÇÃO DO CONTEXTO
        login(data.token, data.usuario);

        // 2. NAVEGUE PARA O DASHBOARD
        navigate("/dashboard");
      } else {
        throw new Error("Resposta de login inválida da API.");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setSubmitStatus({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  // ---> FIM DA MUDANÇA (LOGIN COM EMAIL/SENHA) <---

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setSubmitStatus({ type: "error", message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* O resto do seu JSX (a parte visual) continua exatamente o mesmo */}
      {/* ... */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem vindo!</h1>
          <p className="text-gray-600">Entre com sua conta para continuar</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Informe seu email"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}
                </p>
              )}
            </div>
            {/* Password input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  ref={passwordRef}
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Informe sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.password}
                </p>
              )}
            </div>
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
          {/* Google Sign In */}
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <img
                src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                alt="Google logo"
                className="h-5 w-auto mr-3"
              />
              <span className="font-medium text-gray-700">
                Entrar com o Google
              </span>
            </button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
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
