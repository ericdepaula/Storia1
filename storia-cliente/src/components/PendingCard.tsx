import { Loader2 } from 'lucide-react';

export default function PendingCard(plano: { dias: number | string } ) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col border-2 border-dashed border-blue-300">
      <div className="p-6 flex-grow flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h2 className="text-lg font-bold text-gray-800">
          Gerando Conteúdo
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Plano de {plano.dias} Dias
        </p>
        <p className="text-xs text-gray-500 mt-4">
          Isso pode levar alguns instantes...
        </p>
      </div>
    </div>
  );
}