import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import TimedSnackbar from "./TimedSnackbar"; // Ajuste o caminho se o seu snackbar estiver em outra pasta
import ContentForm from "./ContentForm"; // 1. Importamos nosso novo formulário "burro"

// A "interface" que define as props que este componente recebe
interface FreeContentGeneratorProps {
  onGenerationSuccess: () => void;
}

const FreeContentGenerator: React.FC<FreeContentGeneratorProps> = ({
  onGenerationSuccess,
}) => {
  // --- A LÓGICA "INTELIGENTE" CONTINUA AQUI ---

  // Estados para os dados do formulário, carregamento e avisos
  const [formData, setFormData] = useState({
    setor: "",
    tipoNegocio: "",
    objetivoPrincipal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Esta função será passada para o ContentForm para que ele possa nos avisar sobre as mudanças.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // A lógica de submissão, que é a principal responsabilidade deste componente.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    if (
      !formData.setor ||
      !formData.tipoNegocio ||
      !formData.objetivoPrincipal
    ) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, preencha todos os campos.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Autenticação não encontrada. Faça o login novamente.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/conteudo/gerar-gratis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Falha ao gerar o conteúdo.");
      }

      setSubmitStatus({
        type: "success",
        message: "Conteúdo gerado com sucesso! Atualizando seu painel...",
      });

      setTimeout(() => {
        onGenerationSuccess();
      }, 2000);
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSubmitStatus({ type: "error", message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Receba sua Agenda Gratuita de 5 Dias!
          </h2>
          <p className="text-gray-600 mb-6">
            Preencha os campos abaixo para que nossa IA crie sua primeira
            estratégia de conteúdo personalizada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- A MUDANÇA PRINCIPAL ESTÁ AQUI --- */}
          {/* Delegamos a exibição dos inputs para o componente reutilizável ContentForm */}
          <ContentForm formData={formData} onFormChange={handleInputChange} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Gerando...
              </>
            ) : (
              "Gerar Meu Conteúdo Gratuito"
            )}
          </button>
        </form>
      </div>

      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />
    </>
  );
};

export default FreeContentGenerator;
