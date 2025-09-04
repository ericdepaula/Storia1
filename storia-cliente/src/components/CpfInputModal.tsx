import React, { useState } from 'react';
import Modal from './Modal';

interface CpfInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cpf: string) => void;
  isLoading: boolean;
}

const CpfInputModal: React.FC<CpfInputModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const cleanedCpf = cpf.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (cleanedCpf.length !== 11) {
      setError("Por favor, insira um CPF válido com 11 dígitos.");
      return;
    }
    setError(null);
    onSubmit(cleanedCpf);
    setCpf(''); 
  };

  const handleClose = () => {
    setCpf('');
    setError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Informe seu CPF para o PIX</h2>
        <p className="text-gray-600 mb-6">
          Para gerar a cobrança Pix, precisamos do seu CPF (apenas números).
        </p>
        <input
          type="tel" // Usar 'tel' é bom para teclados numéricos em mobile
          placeholder="Digite os 11 dígitos do seu CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          maxLength={11}
          className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-2">
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Continuando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CpfInputModal;