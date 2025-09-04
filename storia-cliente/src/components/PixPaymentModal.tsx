import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import Modal from "./Modal"; // Reutilizamos nosso componente de Modal base

// As "props" que nosso modal espera receber
interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string | null;
  copiaECola: string | null;
  onPaymentConfirmed: () => void; // Função para ser chamada após o pagamento
}

const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  qrCodeUrl,
  copiaECola,
  onPaymentConfirmed,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (copiaECola) {
      navigator.clipboard.writeText(copiaECola);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reseta o ícone após 2 segundos
    }
  };

  // Função para simular a confirmação e fechar tudo
  const handleConfirm = () => {
    onPaymentConfirmed();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pague com Pix</h2>
        <p className="text-gray-600 mb-6">
          Abra o app do seu banco e escaneie o código abaixo.
        </p>

        {qrCodeUrl ? (
          <div className="flex justify-center mb-6">
            <img
              src={qrCodeUrl}
              alt="QR Code Pix"
              className="w-48 h-48 border-4 border-gray-300 rounded-lg"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg mx-auto mb-6"></div>
        )}

        <p className="text-sm text-gray-500 mb-2">Ou use o Pix Copia e Cola:</p>

        <div className="relative mb-6">
          <input
            type="text"
            readOnly
            value={copiaECola || "Carregando..."}
            className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 pl-4 pr-12 text-sm text-gray-700"
          />
          <button
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-200 rounded-full"
            aria-label="Copiar código Pix"
          >
            {isCopied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
          <p>
            Após o pagamento, o seu conteúdo começará a ser gerado
            automaticamente.
          </p>
        </div>

        <button
          onClick={handleConfirm}
          className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Já paguei, gerar meu conteúdo!
        </button>
      </div>
    </Modal>
  );
};

export default PixPaymentModal;
