import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

// A "interface" define quais props (propriedades) nosso componente espera receber.
interface TimedSnackbarProps {
  status: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
  duration?: number; // Duração em milissegundos
}

const TimedSnackbar: React.FC<TimedSnackbarProps> = ({ status, onClose, duration = 5000 }) => {
  // Estado para controlar se a animação está pausada (quando o mouse está em cima).
  const [isPaused, setIsPaused] = useState(false);
  
  // 'useRef' é como dar um "apelido" para um elemento HTML específico.
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Usamos 'useCallback' para evitar que a função 'onClose' seja recriada a cada renderização.
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Este 'useEffect' é o coração da nossa lógica de fechamento automático.
  useEffect(() => {
    if (!status) {
      return;
    }
    
    const progressBarElement = progressBarRef.current;
    
    // Esta é a função que será executada QUANDO a animação CSS terminar.
    const handleAnimationEnd = () => {
      handleClose();
    };

    // Adicionamos um "ouvinte de evento" ao elemento.
    progressBarElement?.addEventListener('animationend', handleAnimationEnd);

    // A função de "limpeza" remove o ouvinte para evitar vazamentos de memória.
    return () => {
      progressBarElement?.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [status, handleClose]);


  // Funções que pausam e despausam a animação CSS.
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Se 'status' for nulo, o componente não renderiza nada.
  if (!status) {
    return null;
  }

  // Lógica para definir as cores e ícones com base no tipo de aviso.
  const isSuccess = status.type === 'success';
  const theme = {
    bgColor: isSuccess ? 'bg-green-100' : 'bg-red-100',
    textColor: isSuccess ? 'text-green-800' : 'text-red-800',
    borderColor: isSuccess ? 'border-green-200' : 'border-red-200',
    Icon: isSuccess ? CheckCircle : AlertCircle,
    progressBarColor: isSuccess ? 'bg-green-500' : 'bg-red-500',
  };

  return (
    <div 
      className={`fixed bottom-5 right-5 flex items-start p-4 rounded-lg shadow-lg z-50 max-w-sm border overflow-hidden ${theme.bgColor} ${theme.textColor} ${theme.borderColor}`}
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-shrink-0 pt-0.5">
        <theme.Icon className="h-5 w-5" />
      </div>
      <div className="ml-3 text-sm font-medium flex-1">
        {status.message}
      </div>
      <button 
        type="button" 
        onClick={handleClose} 
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent p-1.5 rounded-full inline-flex items-center justify-center h-8 w-8 hover:bg-black/10 focus:outline-none" 
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Barra de Progresso */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
        <div 
          ref={progressBarRef} // Ligamos a ref ao nosso elemento JSX.
          className={`h-full ${theme.progressBarColor} animate-progress-shrink`}
          style={{
            // Definimos a variável CSS que o Tailwind usará para a duração.
            '--snackbar-duration': `${duration}ms`,
            // Pausamos ou continuamos a animação CSS com base no estado 'isPaused'.
            animationPlayState: isPaused ? 'paused' : 'running'
          } as React.CSSProperties}
        ></div>
      </div>
    </div>
  );
};

export default TimedSnackbar;