import React from 'react';
import { X } from 'lucide-react';

interface CheckoutModalProps {
  checkoutUrl: string;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ checkoutUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[90vh] flex flex-col relative">
        <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow p-1 overflow-hidden">
          <iframe
            src={checkoutUrl}
            title="Checkout"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;