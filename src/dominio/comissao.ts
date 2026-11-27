// R-07 a R-11: percentual, cálculo, retenção e estorno. Dono: M10.
// ASSINATURA criada pelo M1 com valor de exemplo. O M10 troca pelo cálculo real, com testes antes.
import type { Afiliacao, Bps, Campanha, Centavos, Comissao, DataISO, Loja, Pedido } from '@/contratos/tipos';

/** R-07. Campanha; sem campanha, o próprio da afiliação; sem os dois, o padrão da loja. */
export function taxaAplicada(campanha: Campanha | undefined, afiliacao: Afiliacao, loja: Loja): Bps {
  void campanha; void afiliacao;
  return loja.comissaoPadraoBps;
}

/** R-08. Math.round(base × bps / 10000), em centavos. */
export function calcularComissao(baseCentavos: Centavos, taxaBps: Bps): Centavos {
  return Math.round((baseCentavos * taxaBps) / 10000);
}

/** R-09. Pagamento + dias de retenção. */
export function dataDeLiberacao(pagoEm: DataISO, retencaoDias: number): DataISO {
  void retencaoDias;
  return pagoEm;
}

/** R-10. Pode devolver a comissão ajustada e, se já paga, um estorno negativo. */
export function aplicarCancelamentoOuDevolucao(c: Comissao, pedido: Pedido): Comissao[] {
  void pedido;
  return [{ ...c, status: 'estornada' }];
}
