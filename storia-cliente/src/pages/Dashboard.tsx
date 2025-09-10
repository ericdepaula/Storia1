import React, { useState } from "react";
import { User, LogOut, Home, FileText, Settings, Menu, X } from "lucide-react";
import TabInicio from "../components/tabs/TabInicio";
import TabConfiguracoes from "../components/tabs/TabConfiguracoes"; // Importe o novo componente
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabaseClient";

const menuItems = [
  { key: "inicio", label: "Inicio", icon: <Home className="w-5 h-5 mr-2" /> },
  {
    key: "conteudo",
    label: "Conteúdo",
    icon: <FileText className="w-5 h-5 mr-2" />,
  },
  {
    key: "configuracoes",
    label: "Configurações",
    icon: <Settings className="w-5 h-5 mr-2" />,
  },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30
                   transform transition-transform duration-300 ease-in-out
                   md:relative md:translate-x-0 
                   ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-blue-700">Dashboard</span>
          <button
            className="md:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition ${
                activeTab === item.key
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setActiveTab(item.key);
                setIsSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            className="flex items-center text-gray-500 hover:text-red-600 transition"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <header className="flex items-center justify-between h-16 px-4 sm:px-8 bg-white border-b border-gray-200">
          <button
            className="text-gray-600 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-3">
              <User className="w-7 h-7 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">{user?.nome}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === "inicio" && <TabInicio />}
          {activeTab === "conteudo" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gerar Conteúdo</h2>
              <p>Em construção...</p>
            </div>
          )}
          {activeTab === "configuracoes" && <TabConfiguracoes />}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;