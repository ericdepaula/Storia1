// Arquivo: storia-cliente/src/components/PixCheckoutModal.tsx
import React from "react";
import { X } from "lucide-react"; // Usaremos o ícone de fechar

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void; // A função onClose agora é simplesmente para fechar
  checkoutUrl: string | null;
}

const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({
  isOpen,
  onClose,
  checkoutUrl,
}) => {
  if (!isOpen) {
    return null;
  }

  // A função que será chamada quando o usuário fechar o modal
  const handleCloseAndRedirect = () => {
    onClose(); // Fecha o modal
    window.location.reload(); // Recarrega a página, atualizando o dashboard
  };

  return (
    // CAMADA 1: O Fundo Escuro (Overlay)
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* CAMADA 2: O Painel Branco */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[90vh] flex flex-col relative">
        {/* Cabeçalho com o botão de fechar */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={handleCloseAndRedirect} // Ação de fechar e recarregar
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Conteúdo (o iframe do checkout) */}
        <div className="flex-grow p-1 overflow-hidden">
          {checkoutUrl ? (
            <iframe
              src={checkoutUrl}
              title="Checkout Pix"
              className="w-full h-full border-0"
            />
          ) : (
            // Um placeholder de carregamento para uma melhor experiência
            <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700"
            onClick={handleCloseAndRedirect}
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PixCheckoutModal;
