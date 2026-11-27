import { describe, expect, it } from 'vitest';
import type { Afiliacao, Campanha, Comissao, Loja, Pedido } from '@/contratos/tipos';
import { aplicarCancelamentoOuDevolucao, calcularComissao, dataDeLiberacao, liberarVencidas, taxaAplicada } from './comissao';

const loja = { comissaoPadraoBps: 1000, retencaoDias: 7 } as Loja;
const afiliacao = (p: Partial<Afiliacao> = {}) => ({ comissaoPropriaBps: undefined, ...p }) as Afiliacao;
const campanha = { comissaoBps: 1500 } as Campanha;
const c = (p: Partial<Comissao> = {}): Comissao => ({
  id: 'cm1', lojaId: 'l1', creatorId: 'c1', pedidoId: 'o1', baseCentavos: 10000, taxaBps: 1000, valorCentavos: 1000,
  tipo: 'venda', status: 'prevista', liberaEm: '2026-11-17T12:00:00.000Z', retida: false, ...p,
});
const pedido = (p: Partial<Pedido>) => ({ baseComissaoCentavos: 10000, devolvidoCentavos: 0, estado: 'pago', ...p }) as Pedido;

describe('R-07 taxaAplicada', () => {
  it('campanha, depois a própria da afiliação, depois a padrão da loja', () => {
    expect(taxaAplicada(campanha, afiliacao({ comissaoPropriaBps: 1200 }), loja)).toBe(1500);
    expect(taxaAplicada(undefined, afiliacao({ comissaoPropriaBps: 1200 }), loja)).toBe(1200);
    expect(taxaAplicada(undefined, afiliacao(), loja)).toBe(1000);
  });
});

describe('R-08 calcularComissao', () => {
  it('arredonda para o centavo mais próximo', () => {
    expect(calcularComissao(38990, 1000)).toBe(3899);
    expect(calcularComissao(12345, 1250)).toBe(1543); // 1543,125
    expect(calcularComissao(5, 1000)).toBe(1); // 0,5 arredonda para cima
    expect(calcularComissao(0, 1500)).toBe(0);
  });
});

describe('R-09 retenção', () => {
  it('libera em pagamento + dias de retenção', () => {
    expect(dataDeLiberacao('2026-11-10T13:05:00Z', 7)).toBe('2026-11-17T13:05:00.000Z');
    expect(dataDeLiberacao('2026-11-10T13:05:00Z', 0)).toBe('2026-11-10T13:05:00.000Z');
  });
  it('libera só as previstas vencidas e não retidas (R-11)', () => {
    const lista = [c(), c({ id: 'cm2', retida: true }), c({ id: 'cm3', liberaEm: '2026-12-01T00:00:00Z' }), c({ id: 'cm4', status: 'paga' })];
    const r = liberarVencidas(lista, '2026-11-20T00:00:00Z');
    expect(r.map((x) => x.status)).toEqual(['liberada', 'prevista', 'prevista', 'paga']);
  });
});

describe('R-10 cancelamento e devolução', () => {
  it('pedido pago não muda nada', () => {
    expect(aplicarCancelamentoOuDevolucao(c(), pedido({ estado: 'pago' }))).toEqual([c()]);
  });
  it('cancelado antes de pagar: estornada', () => {
    for (const status of ['prevista', 'liberada'] as const) {
      const r = aplicarCancelamentoOuDevolucao(c({ status }), pedido({ estado: 'cancelado' }));
      expect(r).toHaveLength(1);
      expect(r[0]!.status).toBe('estornada');
    }
  });
  it('devolução parcial recalcula proporcionalmente', () => {
    const r = aplicarCancelamentoOuDevolucao(c(), pedido({ estado: 'devolvido_parcial', devolvidoCentavos: 4000 }));
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ baseCentavos: 6000, valorCentavos: 600, status: 'prevista' });
  });
  it('estorno depois de pago: mantém a paga e cria comissão negativa', () => {
    const paga = c({ status: 'paga', pagamentoId: 'pg1' });
    const r = aplicarCancelamentoOuDevolucao(paga, pedido({ estado: 'devolvido', devolvidoCentavos: 10000, canceladoEm: '2026-11-20T10:00:00Z' }));
    expect(r).toHaveLength(2);
    expect(r[0]).toEqual(paga);
    expect(r[1]).toMatchObject({ tipo: 'estorno', valorCentavos: -1000, baseCentavos: -10000, status: 'liberada', pedidoId: 'o1' });
    expect(r[1]!.pagamentoId).toBeUndefined();
  });
  it('devolução parcial depois de pago: estorno só da diferença', () => {
    const r = aplicarCancelamentoOuDevolucao(c({ status: 'paga' }), pedido({ estado: 'devolvido_parcial', devolvidoCentavos: 2500 }));
    expect(r[1]).toMatchObject({ tipo: 'estorno', valorCentavos: -250 });
  });
  it('já estornada fica como está', () => {
    expect(aplicarCancelamentoOuDevolucao(c({ status: 'estornada' }), pedido({ estado: 'cancelado' }))).toEqual([c({ status: 'estornada' })]);
  });
});
