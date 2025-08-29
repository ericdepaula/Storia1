import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate, // 1. Importe o useNavigate
  useLocation, // 2. Importe o useLocation
} from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import React, { useEffect } from "react"; // 3. Importe o useEffect

// Componente Wrapper para lidar com a lógica de renderização e redirecionamento
const AppContent = () => {
  const { token, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se não estivermos carregando o estado inicial e já tivermos um token...
    // ... e não estivermos já no dashboard ou em alguma sub-rota dele...
    if (!isLoading && token && !location.pathname.startsWith("/dashboard")) {
      // ... então redirecionamos para o dashboard.
      navigate("/dashboard", { replace: true });
    }
  }, [token, isLoading, navigate, location.pathname]);

  // Enquanto o estado de autenticação está sendo verificado, mostramos um loader.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // A lógica de renderização das rotas baseada no token
  return (
    <Routes>
      <Route
        path="/signin"
        element={token ? <Navigate to="/dashboard" /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/dashboard" /> : <SignUp />}
      />

      <Route
        path="/dashboard/*" // Use /* para cobrir sub-rotas do dashboard
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rota raiz e rotas "pega-tudo" */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/signin"} replace />}
      />
    </Routes>
  );
};

// Componente principal agora usa o Wrapper dentro do Router
function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  // isLoading já é tratado no AppContent, mas é uma segurança extra aqui.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

// Os componentes placeholder podem ser removidos daqui pois não estão sendo usados
// nas rotas principais, para simplificar.

export default App;
