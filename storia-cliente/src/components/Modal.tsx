import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* CAMADA 2: O Painel (o "balaio" branco). Aqui estão as mudanças. */}
      <div
        onClick={(e) => e.stopPropagation()}
        // Adicionamos 'max-h-[90vh]' para limitar a altura e 'flex flex-col' para organizar o conteúdo interno.
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]"
      >
        {/* Opcional: Adicionamos um cabeçalho fixo para o botão de fechar */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CAMADA 3: A Área de Conteúdo (com rolagem interna) */}
        {/* Adicionamos 'overflow-y-auto' para que apenas esta área role se o conteúdo for muito grande. */}
        <div className="p-6 sm:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
