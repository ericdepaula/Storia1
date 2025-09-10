import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../config/supabaseClient";

interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
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
  const [isLoading, setIsLoading] = useState(true); // Começa como true

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

  useEffect(() => {
    // onAuthStateChange lida com TUDO: login, logout e a sessão inicial.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Este evento roda na carga inicial da página
      if (event === "INITIAL_SESSION") {
        if (session) {
          // Se o Supabase encontrou uma sessão (na URL ou localStorage),
          // buscamos nosso token da API.
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
                login(data.token, data.usuario);
              }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false)); // Finaliza o loading após a verificação
        } else {
          // Nenhuma sessão encontrada
          setIsLoading(false);
        }
      }
      // Este evento roda quando o usuário faz login (ex: com Google)
      else if (event === "SIGNED_IN" && session) {
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
              login(data.token, data.usuario);
            }
          })
          .catch(console.error);
      }
      // Este evento roda quando o usuário faz logout
      else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
