// src/mappers/conteudoMapper.js

import { planosDeProduto } from "../config/stripeConfig.js";

/**
 * Transforma os dados brutos do banco em uma lista unificada e enriquecida para a view.
 * @param {Array} conteudosProntos - A lista de conteúdos da tabela 'conteudos_gerados'.
 * @param {Array} comprasPendentes - A lista de compras da tabela 'compras' com status 'PENDENTE'.
 * @returns {Array} - A lista final, pronta para ser enviada ao front-end.
 */
const mapearListaDeConteudos = (conteudosProntos, comprasPendentes) => {
  // 1. Transforma as compras pendentes em "cards fantasmas".
  const conteudosPendentesFormatados = comprasPendentes.map((compra) => ({
    id: `pendente-${compra.id}`,
    created_at: compra.created_at,
    conteudo_gerado: JSON.stringify({
      analiseEstrategica: { funilEscolhido: "Gerando Estratégia..." },
      agendaDePostagens: [],
    }),
    compra_id: compra.id,
    status_entrega: "PENDENTE",
    plano: planosDeProduto[compra.preco_id] || { nome: "Plano", dias: "?" },
  }));

  // 2. Enriquece os conteúdos que já estão prontos com os dados do plano.
  const conteudosProntosFormatados = conteudosProntos.map((conteudo) => {
    let planoInfo = null;
    if (conteudo.compra_id === null) {
      planoInfo = { nome: "Plano Gratuito", dias: 5 };
    } else if (conteudo.compras && planosDeProduto[conteudo.compras.preco_id]) {
      planoInfo = planosDeProduto[conteudo.compras.preco_id];
    }

    return {
      ...conteudo,
      status_entrega: "ENTREGUE",
      plano: planoInfo || { nome: "Plano Desconhecido", dias: "?" },
    };
  });

  // 3. Junta tudo em uma única lista e ordena.
  const listaCompleta = [
    ...conteudosProntosFormatados,
    ...conteudosPendentesFormatados,
  ];
  listaCompleta.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return listaCompleta;
};

export const conteudoMapper = {
  mapearListaDeConteudos,
};
