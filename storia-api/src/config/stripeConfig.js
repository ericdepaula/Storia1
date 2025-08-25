// Este arquivo mapeia os IDs de Preço da Stripe aos nossos planos de negócio.
// É a "tabela de preços" do nosso sistema.

export const planosDeProduto = {
  // Cole aqui o ID do Preço do seu plano de 5 dias
  price_1RlVyGPphAIQfHkyDqPFVhCz: {
    nome: "Agenda Estratégica de 5 Dias",
    dias: 5,
    isFree: true,
  },
  // Cole aqui o ID do Preço do seu plano de 30 dias
  price_1RkvTvPphAIQfHkyLv2HNYci: {
    nome: "Agenda Estratégica de 30 Dias",
    dias: 30,
    isFree: false,
  },
  // Cole aqui o ID do Preço do seu plano de 60 dias
  price_1RlVzHPphAIQfHkypaLBoAxR: {
    nome: "Agenda Estratégica de 60 Dias",
    dias: 60,
    isFree: false,
  },
  // Cole aqui o ID do Preço do seu plano de 90 dias
  price_1RlW0CPphAIQfHkyzHVlqqyx: {
    nome: "Agenda Estratégica de 90 Dias",
    dias: 90,
    isFree: false,
  },
};
