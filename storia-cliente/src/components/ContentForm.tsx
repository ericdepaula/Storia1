import React from "react";

// Interface para os dados do formulário
interface FormData {
  setor: string;
  tipoNegocio: string;
  objetivoPrincipal: string;
}

// Interface para as props que o componente espera receber do pai
interface ContentFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContentForm: React.FC<ContentFormProps> = ({
  formData,
  onFormChange,
}) => {
  return (
    // Usamos um React.Fragment <> pois o container principal (o <form>) já está no componente pai.
    <>
      <input
        name="setor"
        type="text"
        value={formData.setor}
        onChange={onFormChange}
        placeholder="Seu setor de atuação (ex: Saúde, Varejo)"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="tipoNegocio"
        type="text"
        value={formData.tipoNegocio}
        onChange={onFormChange}
        placeholder="Seu tipo de negócio (ex: Clínica de estética)"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="objetivoPrincipal"
        type="text"
        value={formData.objetivoPrincipal}
        onChange={onFormChange}
        placeholder="Seu principal objetivo (ex: Vender mais)"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </>
  );
};

export default ContentForm;
