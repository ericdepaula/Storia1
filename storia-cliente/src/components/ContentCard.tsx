import React from 'react';
import { Download } from 'lucide-react'; // 1. Importamos o ícone para o novo botão

// --- A "interface" ou "contrato" do componente (sem alterações) ---
interface Conteudo {
  id: number | string;
  created_at: string;
  conteudo_gerado: string;
  compra_id: number | null;
  plano: {
    nome: string;
    dias: number | string;
  } | null;
}

interface ContentCardProps {
  conteudo: Conteudo;
}

const ContentCard: React.FC<ContentCardProps> = ({ conteudo }) => {
  // A lógica para "desempacotar" o JSON do conteúdo.
  let dados;
  try {
    dados = JSON.parse(conteudo.conteudo_gerado);
  } catch (error) {
    console.error("Erro ao processar o JSON do conteúdo:", error);
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Erro ao carregar dados.</div>;
  }

  const analise = dados.analiseEstrategica;

  // A função para formatar a data.
  const formatarData = (dataIso: string): string => {
    if (!dataIso) return 'Data indisponível';
    return new Date(dataIso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  // --- 2. NOVA FUNÇÃO PARA EXPORTAR O CSV ---
  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();

    const { agendaDePostagens } = dados;
    if (!agendaDePostagens) {
      alert("Nenhuma agenda de postagens encontrada para exportar.");
      return;
    }

    // Função interna para garantir que o texto seja seguro para CSV
    const escapeCsvCell = (cell: string) => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        // Se a célula contém caracteres especiais, ela é envolvida em aspas duplas.
        // Aspas duplas existentes dentro da célula são duplicadas.
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    };

    const headers = ['Dia', 'Etapa Funil', 'Formato Sugerido', 'Título', 'Conteúdo', 'Sugestão Visual', 'Hashtags'];

    const rows = agendaDePostagens.map((post: any) => [
      post.dia,
      escapeCsvCell(post.etapaFunil || ''),
      escapeCsvCell(post.formatoSugerido || ''),
      escapeCsvCell(post.titulo || ''),
      escapeCsvCell(post.conteudo || ''),
      escapeCsvCell(post.sugestaoVisual || ''),
      escapeCsvCell(post.hashtags.join(', ') || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    // Cria e aciona o download do arquivo
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF para compatibilidade com Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${analise.tituloEstrategia}.csv`); // Usamos o título da análise
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${conteudo.compra_id === null ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {conteudo.plano ? `${conteudo.plano.dias} Dias` : 'Plano'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {analise.tituloEstrategia || 'Agenda de Conteúdo'}
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Criado em: {formatarData(conteudo.created_at)}
        </p>

        <p className="text-gray-600 text-base leading-relaxed italic">
          "{analise ? analise.justificativa : 'Justificativa indisponível.'}"
        </p>
      </div>

      {/* --- 3. ATUALIZAÇÃO NOS BOTÕES DE AÇÃO --- */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-2"> {/* Usamos gap-2 para um pequeno espaçamento e flex-wrap para responsividade */}
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
            Ver Completo
          </button>
          {/* BOTÃO DE EXPORTAR */}
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;