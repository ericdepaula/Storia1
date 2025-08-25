export const iaConfig = {
  systemPrompt: 'Você é um assistente de IA. Siga estritamente as instruções fornecidas no prompt do usuário.', // O prompt do sistema pode ser mais genérico agora.
  model: 'gpt-4o', // Para tarefas complexas e longas, um modelo mais avançado como o gpt-4o é recomendado.
  temperature: 0.7,
  maxTokens: 8000, // Aumente significativamente! Verifique o limite do modelo escolhido.
};