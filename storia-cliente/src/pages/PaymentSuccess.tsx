import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  useEffect(() => {
    // Este script executa assim que a página carrega.
    // window.top se refere à janela principal do navegador, ignorando o iframe.
    const timer = setTimeout(() => {
      if (window.top) {
        window.top.location.href = '/dashboard';
      } else {
        // Fallback caso não esteja em um iframe
        window.location.href = '/dashboard';
      }
    }, 1500); // Um pequeno atraso para o usuário ver a mensagem

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Pagamento Confirmado!</h1>
      <p className="text-gray-600 mt-2">
        Aguarde, estamos redirecionando você para o dashboard...
      </p>
    </div>
  );
};

export default PaymentSuccess;