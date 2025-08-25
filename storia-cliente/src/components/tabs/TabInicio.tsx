import React, { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import ContentCard from "../ContentCard";
import Modal from "../Modal";
import FreeContentGenerator from "../FreeContentGenerator";
import PaidContentForm from "../PaidContentForm";
import PendingCard from "../PendingCard";

// A "interface" define a estrutura dos dados que esperamos receber do back-end
interface Conteudo {
  id: number;
  created_at: string;
  conteudo_gerado: string;
  compra_id: number | null;
  status_entrega?: "PENDENTE" | "ENTREGUE";
  plano: {
    nome: string;
    dias: number;
  } | null;
}

// Tipagem para os itens da agenda de postagens
interface AgendaPostagem {
  dia: number;
  etapaFunil: string;
  titulo: string;
  conteudo: string;
  sugestaoVisual: string;
  hashtags: string[];
}

// Componente interno para exibir os detalhes do conteúdo dentro do Modal
const DetalhesConteudo: React.FC<{ conteudo: Conteudo }> = ({ conteudo }) => {
  let dados;
  try {
    dados = JSON.parse(conteudo.conteudo_gerado);
  } catch {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Erro ao carregar dados deste conteúdo.
      </div>
    );
  }

  const { analiseEstrategica, agendaDePostagens } = dados;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {analiseEstrategica.tituloEstrategia || "Agenda de Conteúdo"}
        </h3>
        <p className="mt-2 text-gray-600 italic">
          "{analiseEstrategica.justificativa}"
        </p>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">
          Agenda de Postagens ({conteudo.plano?.dias} Dias)
        </h4>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
          {agendaDePostagens &&
            (agendaDePostagens as AgendaPostagem[]).map((post) => (
              <div
                key={post.dia}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="font-bold text-blue-600">
                  Dia {post.dia} - {post.etapaFunil}
                </p>
                <p className="font-semibold mt-2 text-gray-800">
                  {post.titulo}
                </p>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {post.conteudo}
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  <strong>Visual:</strong> {post.sugestaoVisual}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <strong>Hashtags:</strong> {post.hashtags.join(" ")}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// --- O COMPONENTE PRINCIPAL ---
const TabInicio: React.FC = () => {
  // --- Estados para controlar a UI ---
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Conteudo | null>(null);
  const isInitialFetch = useRef(true);

  // --- Lógica de Busca de Dados ---
  const fetchConteudos = useCallback(async () => {
    if (isInitialFetch.current) setIsLoading(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Você não está autenticado. Por favor, faça o login novamente.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/conteudo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setConteudos(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false);
      isInitialFetch.current = false;
    }
  }, []);

  // Efeito para a busca inicial de dados
  useEffect(() => {
    fetchConteudos();
  }, [fetchConteudos]);

  // Efeito para a atualização automática (polling)
  useEffect(() => {
    const hasPendingItems = conteudos.some(
      (c) => c.status_entrega === "PENDENTE"
    );
    if (hasPendingItems) {
      const intervalId = setInterval(() => {
        fetchConteudos();
      }, 15000); // Verifica a cada 15 segundos
      return () => clearInterval(intervalId); // Limpa o timer
    }
  }, [conteudos, fetchConteudos]);

  // --- Funções de Manipulação (Handlers) ---
  const handleGenerationSuccess = () => {
    setIsGeneratorModalOpen(false);
    fetchConteudos();
  };

  // --- Renderização ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Buscando seus conteúdos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
        role="alert"
      >
        <p className="font-bold">Ocorreu um erro:</p>
        <p>{error}</p>
      </div>
    );
  }

  // Variável que determina se o usuário já usou o conteúdo gratuito
  const hasUsedFreeContent = conteudos.some((c) => c.compra_id === null);

  return (
    <div>
      {/* Botão "Gerar Novo Conteúdo" só aparece se já houver algum conteúdo na tela */}
      {conteudos.length > 0 && (
        <div className="mb-6 text-right">
          <button
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsGeneratorModalOpen(true)}
          >
            Gerar Novo Conteúdo
          </button>
        </div>
      )}

      {/* Renderização principal: ou o estado vazio, ou a galeria de cards */}
      {conteudos.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-800">
            Nenhum conteúdo encontrado
          </h3>
          <p className="mt-2 text-gray-500">
            Parece que você ainda não gerou sua primeira agenda.
          </p>
          <button
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            onClick={() => setIsGeneratorModalOpen(true)}
          >
            Gerar Conteúdo Gratuito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {conteudos.map((item) =>
            item.status_entrega === "PENDENTE" ? (
              <PendingCard key={item.id} dias={item.plano?.dias ?? ""} />
            ) : (
              <div
                key={item.id}
                className="cursor-pointer"
                onClick={() => setSelectedContent(item)}
              >
                <ContentCard conteudo={item} />
              </div>
            )
          )}
        </div>
      )}

      {/* Modal para gerar novo conteúdo */}
      <Modal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
      >
        {hasUsedFreeContent ? (
          // ADICIONE A PROP onGenerationSuccess AQUI
          <PaidContentForm onGenerationSuccess={handleGenerationSuccess} />
        ) : (
          <FreeContentGenerator onGenerationSuccess={handleGenerationSuccess} />
        )}
      </Modal>

      {/* Modal para exibir os detalhes do conteúdo */}
      <Modal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      >
        {selectedContent && <DetalhesConteudo conteudo={selectedContent} />}
      </Modal>
    </div>
  );
};

export default TabInicio;
