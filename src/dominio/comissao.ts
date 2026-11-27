// R-07 a R-11: percentual, cálculo, retenção e estorno. Dono: M10.
import type { Afiliacao, Bps, Campanha, Centavos, Comissao, DataISO, Loja, Pedido } from '@/contratos/tipos';

/** R-07. Campanha; sem campanha, o próprio da afiliação; sem os dois, o padrão da loja. */
export function taxaAplicada(campanha: Campanha | undefined, afiliacao: Afiliacao, loja: Loja): Bps {
  return campanha?.comissaoBps ?? afiliacao.comissaoPropriaBps ?? loja.comissaoPadraoBps;
}

/** R-08. Math.round(base × bps / 10000), em centavos. */
export function calcularComissao(baseCentavos: Centavos, taxaBps: Bps): Centavos {
  return Math.round((baseCentavos * taxaBps) / 10000);
}

/** R-09. Pagamento + dias de retenção. */
export function dataDeLiberacao(pagoEm: DataISO, retencaoDias: number): DataISO {
  return new Date(Date.parse(pagoEm) + retencaoDias * 86_400_000).toISOString();
}

/** R-09 e R-11. Cron diário: previstas vencidas viram liberadas; retidas esperam a loja revisar. */
export function liberarVencidas(comissoes: Comissao[], agora: DataISO): Comissao[] {
  const t = Date.parse(agora);
  return comissoes.map((c) => (c.status === 'prevista' && !c.retida && Date.parse(c.liberaEm) <= t ? { ...c, status: 'liberada' } : c));
}

/**
 * R-10. Cancelado ou devolvido antes de pagar: estornada. Devolução parcial: recalcula proporcionalmente.
 * Já paga: mantém e cria uma comissão "estorno" negativa, descontada no próximo pagamento.
 */
export function aplicarCancelamentoOuDevolucao(c: Comissao, pedido: Pedido): Comissao[] {
  if (c.tipo !== 'venda' || c.status === 'estornada') return [c];
  const total = pedido.estado === 'cancelado' || pedido.estado === 'devolvido';
  const parcial = pedido.estado === 'devolvido_parcial';
  if (!total && !parcial) return [c];

  const novaBase = total ? 0 : Math.max(0, pedido.baseComissaoCentavos - pedido.devolvidoCentavos);
  const novoValor = calcularComissao(novaBase, c.taxaBps);

  if (c.status !== 'paga') {
    return total ? [{ ...c, status: 'estornada' }] : [{ ...c, baseCentavos: novaBase, valorCentavos: novoValor }];
  }
  const diferenca = c.valorCentavos - novoValor;
  if (diferenca <= 0) return [c];
  const { pagamentoId: _pago, ...semPagamento } = c;
  void _pago;
  return [c, {
    ...semPagamento, id: `${c.id}-estorno`, tipo: 'estorno', status: 'liberada', retida: false,
    baseCentavos: -(c.baseCentavos - novaBase), valorCentavos: -diferenca, liberaEm: pedido.canceladoEm ?? c.liberaEm,
  }];
}
