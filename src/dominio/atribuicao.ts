// R-01 a R-06: a quem e a qual campanha o pedido pertence. Dono: M4.
// ASSINATURA criada pelo M1 com valor de exemplo. O M4 troca pelo cálculo real, com testes antes.
import type { Afiliacao, Campanha, Centavos, Creator, Cupom, Participacao, Pedido } from '@/contratos/tipos';

/** R-05. Subtotal menos desconto, sem frete, nunca negativa. */
export function calcularBaseComissao(p: Pick<Pedido, 'subtotalCentavos' | 'descontoCentavos'>): Centavos {
  return p.subtotalCentavos - p.descontoCentavos;
}

export interface ResultadoAtribuicao { creatorId?: string; campanhaId?: string; geraComissao: boolean; motivo?: string }

/** R-01 a R-06. */
export function atribuirPedido(
  pedido: Pedido, cupons: Cupom[], afiliacoes: Afiliacao[], creators: Creator[],
  campanhas: Campanha[], participacoes: Participacao[],
): ResultadoAtribuicao {
  void afiliacoes; void creators; void campanhas; void participacoes;
  const cupom = cupons.find((c) => c.codigo === pedido.cupom);
  return cupom ? { creatorId: cupom.creatorId, geraComissao: pedido.estado === 'pago' } : { geraComissao: false, motivo: 'exemplo' };
}
