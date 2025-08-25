import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import TimedSnackbar from "./TimedSnackbar";
import ContentForm from "./ContentForm";
import Modal from "./Modal"; // Usaremos nosso componente de Modal existente
import EmbeddedCheckout from "./EmbeddedCheckout"; // Importamos o novo componente de checkout

interface PaidContentFormProps {
  onGenerationSuccess: () => void;
}

const PaidContentForm: React.FC<PaidContentFormProps> = ({ onGenerationSuccess }) => {
  const [formData, setFormData] = useState({
    setor: "",
    tipoNegocio: "",
    objetivoPrincipal: "",
  });
  const [priceId, setPriceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  type SubmitStatus = { type: "error" | "success"; message: string } | null;
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  // Estados para controlar o modal e o clientSecret
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);
    setClientSecret(null);

    if (!priceId) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, selecione um plano.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/pagamentos/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            priceId,
            usuarioId: userInfo.id,
            promptData: formData,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Falha ao iniciar o pagamento.");

      setClientSecret(data.clientSecret); // Salvamos o clientSecret
      setIsModalOpen(true); // Abrimos o modal
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro.";
      if (err instanceof Error) errorMessage = err.message;
      setSubmitStatus({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsModalOpen(false); // Fecha o modal de pagamento
    onGenerationSuccess();  // Chama a função do componente pai para atualizar a lista
  };

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Gerar Mais Conteúdo
          </h2>
          <p className="text-gray-600 mb-6">
            Selecione um plano para criar estratégias de conteúdo incríveis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ContentForm formData={formData} onFormChange={handleInputChange} />
          {/* ... Lógica dos botões de plano ... */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione a quantidade de dias:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`block p-4 border rounded-lg cursor-pointer text-center ${
                  priceId === "price_1RkvTvPphAIQfHkyLv2HNYci"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plano"
                  value="price_1RkvTvPphAIQfHkyLv2HNYci"
                  className="sr-only"
                  onChange={(e) => setPriceId(e.target.value)}
                />
                <span className="text-lg font-semibold">30 Dias</span>
              </label>
              <label
                className={`block p-4 border rounded-lg cursor-pointer text-center ${
                  priceId === "price_1RlVzHPphAIQfHkypaLBoAxR"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plano"
                  value="price_1RlVzHPphAIQfHkypaLBoAxR"
                  className="sr-only"
                  onChange={(e) => setPriceId(e.target.value)}
                />
                <span className="text-lg font-semibold">60 Dias</span>
              </label>
              <label
                className={`block p-4 border rounded-lg cursor-pointer text-center ${
                  priceId === "price_1RlW0CPphAIQfHkyzHVlqqyx"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plano"
                  value="price_1RlW0CPphAIQfHkyzHVlqqyx"
                  className="sr-only"
                  onChange={(e) => setPriceId(e.target.value)}
                />
                <span className="text-lg font-semibold">90 Dias</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Carregando...
              </>
            ) : (
              "Comprar e Gerar Conteúdo"
            )}
          </button>
        </form>
      </div>

      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />

      {/* Modal que abre com o formulário de pagamento */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="h-[600px] w-full">
          {/* 3. Passe a nova função para o EmbeddedCheckout */}
          {clientSecret && (
            <EmbeddedCheckout
              clientSecret={clientSecret}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default PaidContentForm;
