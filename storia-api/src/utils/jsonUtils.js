/**
 * Extrai uma string JSON de um texto que pode conter outros caracteres,
 * como blocos de markdown ('```json').
 * @param {string} texto - O texto bruto recebido da IA.
 * @returns {string} - A string JSON pura e limpa.
 */
export function extrairJSON(texto) {
  if (!texto || typeof texto !== "string") {
    throw new Error(
      "Entrada inválida: o texto para extrair JSON está vazio ou não é uma string."
    );
  }

  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");

  if (inicio === -1 || fim === -1) {
    console.error(
      "Não foi possível encontrar um objeto JSON na resposta da IA:",
      texto
    );
    throw new Error("A resposta da IA não continha um formato JSON válido.");
  }

  return texto.substring(inicio, fim + 1);
}
