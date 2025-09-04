import React, { useState } from "react";
import { Loader2, CreditCard, QrCode } from "lucide-react";
import TimedSnackbar from "./TimedSnackbar";
import ContentForm from "./ContentForm";
import Modal from "./Modal";
import EmbeddedCheckout from "./EmbeddedCheckout";
import PixPaymentModal from "./PixPaymentModal";

interface PaidContentFormProps {
  onGenerationSuccess: () => void;
}

interface PixData {
  qrCodeUrl: string;
  copiaECola: string;
}

const PaidContentForm: React.FC<PaidContentFormProps> = ({
  onGenerationSuccess,
}) => {
  const [formData, setFormData] = useState({
    setor: "",
    tipoNegocio: "",
    objetivoPrincipal: "",
  });
  const [priceId, setPriceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  type SubmitStatus = { type: "error" | "success"; message: string } | null;
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInitiatePayment = async (method: "stripe" | "pix") => {
    setIsLoading(true);
    setSubmitStatus(null);

    if (
      !priceId ||
      !formData.setor ||
      !formData.tipoNegocio ||
      !formData.objetivoPrincipal
    ) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, preencha todos os campos antes de pagar.",
      });
      setIsLoading(false);
      return;
    }

    // --- ESTA É A MUDANÇA ---
    let userTaxId = null;
    if (method === "pix") {
      userTaxId = prompt(
        "Para pagamentos com Pix, por favor, informe seu CPF (apenas números):"
      );
      if (!userTaxId || !/^\d{11}$/.test(userTaxId)) {
        // Validação simples de 11 dígitos
        setSubmitStatus({
          type: "error",
          message: "CPF inválido. O pagamento foi cancelado.",
        });
        setIsLoading(false);
        return;
      }
    }
    // -------------------------

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = localStorage.getItem("authToken");

      const endpoint =
        method === "stripe"
          ? `${
              import.meta.env.VITE_API_BASE_URL
            }/api/pagamentos/checkout-stripe`
          : `${import.meta.env.VITE_API_BASE_URL}/api/pagamentos/checkout-pix`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          usuarioId: userInfo.id,
          promptData: formData,
          taxId: userTaxId, // Enviamos o CPF para o backend
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Falha ao iniciar o pagamento.");

      if (method === "stripe") {
        setClientSecret(data.clientSecret);
        setIsStripeModalOpen(true);
      } else {
        setPixData({ qrCodeUrl: data.qrCode, copiaECola: data.copiaECola });
        setIsPixModalOpen(true);
      }
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro.";
      if (err instanceof Error) errorMessage = err.message;
      setSubmitStatus({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsStripeModalOpen(false);
    setIsPixModalOpen(false);
    onGenerationSuccess();
    setSubmitStatus({
      type: "success",
      message: "Pagamento confirmado! Seu conteúdo já está sendo preparado.",
    });
  };

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        {/* ... (código do formulário e botões de plano inalterado) ... */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Gerar Mais Conteúdo
          </h2>
          <p className="text-gray-600 mb-6">
            Preencha os detalhes, selecione um plano e escolha como pagar.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <ContentForm formData={formData} onFormChange={handleInputChange} />

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

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-center text-sm font-medium text-gray-700">
              Escolha o método de pagamento:
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => handleInitiatePayment("stripe")}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <CreditCard className="h-5 w-5 mr-2" />
                )}
                Pagar com Cartão
              </button>
              <button
                type="button"
                onClick={() => handleInitiatePayment("pix")}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <QrCode className="h-5 w-5 mr-2" />
                )}
                Pagar com PIX
              </button>
            </div>
          </div>
        </form>
      </div>

      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />

      <Modal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
      >
        <div className="h-[600px] w-full">
          {clientSecret && (
            <EmbeddedCheckout
              clientSecret={clientSecret}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </Modal>

      <PixPaymentModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        qrCodeUrl={pixData?.qrCodeUrl ?? null}
        copiaECola={pixData?.copiaECola ?? null}
        onPaymentConfirmed={handlePaymentSuccess}
      />
    </>
  );
};

export default PaidContentForm;
