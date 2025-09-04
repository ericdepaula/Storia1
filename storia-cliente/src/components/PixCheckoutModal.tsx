// Arquivo: storia-cliente/src/components/PixCheckoutModal.tsx
import React from "react";
import Modal from "./Modal"; // Reutilizamos nosso Modal base

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string | null;
  onPaymentSuccess: () => void; // Para sabermos quando o usuário fechar após pagar
}

const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({
  isOpen,
  onClose,
  checkoutUrl,
}) => {


  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-[80vh] w-full">
        <div className="flex-grow">
          {checkoutUrl ? (
            <iframe
              src={checkoutUrl}
              title="Checkout Pix"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PixCheckoutModal;
