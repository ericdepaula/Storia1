import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../config/supabaseClient"; // <-- 1. IMPORTE O SUPABASE

interface User {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("userInfo", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    setToken(null);
    setUser(null);
  };

  // ---> INÍCIO DA LÓGICA CENTRALIZADA <---
  useEffect(() => {
    // Primeiro, verifica se já existe um token no localStorage ao carregar a página
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("userInfo");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    // Agora, escuta por mudanças no estado de autenticação do Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Se o evento for um login bem-sucedido (como o retorno do Google)
      if (event === "SIGNED_IN" && session) {
        // Buscamos nosso próprio token da nossa API
        fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/usuarios/auth/google/callback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session }),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.token && data.usuario) {
              // Usamos nossa função login para atualizar o estado global
              login(data.token, data.usuario);
            }
          })
          .catch(console.error);
      }
      // Se o evento for um logout, limpamos a sessão
      else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    // Função de limpeza para remover o "ouvinte"
    return () => {
      subscription.unsubscribe();
    };
  }, []); // O array vazio garante que isso rode apenas uma vez
  // ---> FIM DA LÓGICA CENTRALIZADA <---

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
