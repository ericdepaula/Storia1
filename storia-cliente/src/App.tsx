import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

// --- ETAPA 1: CRIANDO O NOSSO "SEGURANÇA DE ROTA" ---
// Este componente verifica se o usuário está logado.
import React from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/signin" replace />; 
  }

  // Se houver um token, permitimos o acesso e renderizamos o componente filho (o Dashboard).
  return children;
}


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redireciona a rota raiz para a página de login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rotas de Autenticação (públicas) */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* --- ETAPA 2: APLICANDO A SEGURANÇA NA ROTA DO DASHBOARD --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rotas de placeholder (continuam públicas) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Rota "pega-tudo" para caminhos não encontrados */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// Placeholder components for additional pages
const ForgotPassword = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-gray-600">This is a placeholder page for password reset functionality.</p>
      </div>
      <div className="bg-white backdrop-blur-sm bg-opacity-95 rounded-2xl shadow-xl p-8 border border-gray-100">
        <p className="text-gray-700 mb-4">
          Em construção... Por enquanto, você pode voltar para a página de login.
        </p>
        <p className="text-gray-500 mb-4">
          Se você esqueceu sua senha, entre em contato com o suporte para assistência.
        </p>
        <a href="/signin" className="text-blue-600 hover:text-blue-800 hover:underline">
          ← Voltar para Login
        </a>
      </div>
    </div>
  </div>
);

const TermsOfService = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last updated: January 2025</p>
      </div>
      <div className="bg-white backdrop-blur-sm bg-opacity-95 rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          <h2 className="text-xl font-semibold mb-4">2. Privacy Policy</h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
          </p>
          <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account.
          </p>
        </div>
        <div className="mt-8 text-center">
          <a href="/signup" className="text-blue-600 hover:text-blue-800 hover:underline">
            ← Voltar para Cadastro
          </a>
        </div>
      </div>
    </div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: January 2025</p>
      </div>
      <div className="bg-white backdrop-blur-sm bg-opacity-95 rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us.
          </p>
          <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
          </p>
          <h2 className="text-xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </div>
        <div className="mt-8 text-center">
          <a href="/signup" className="text-blue-600 hover:text-blue-800 hover:underline">
            ← Voltar para Cadastro
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default App;