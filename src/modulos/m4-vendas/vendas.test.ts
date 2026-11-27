import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { assinaturaValida } from './hmac';
import { estadoDoPedido, mapearPedido, reembolsoDoHistorico, ufDaProvincia, type PedidoApi } from './pedido-mapa';

describe('assinatura do webhook', () => {
  const corpo = '{"store_id":123,"event":"order/paid","id":99}';
  const hex = createHmac('sha256', 'segredo').update(corpo).digest('hex');
  it('aceita a assinatura certa, em hexadecimal ou base64', () => {
    expect(assinaturaValida(corpo, hex, 'segredo')).toBe(true);
    expect(assinaturaValida(corpo, hex.toUpperCase(), 'segredo')).toBe(true);
    expect(assinaturaValida(corpo, createHmac('sha256', 'segredo').update(corpo).digest('base64'), 'segredo')).toBe(true);
  });
  it('recusa corpo alterado, segredo errado, ausência e lixo', () => {
    expect(assinaturaValida(corpo + ' ', hex, 'segredo')).toBe(false);
    expect(assinaturaValida(corpo, hex, 'outro')).toBe(false);
    expect(assinaturaValida(corpo, null, 'segredo')).toBe(false);
    expect(assinaturaValida(corpo, hex, undefined)).toBe(false);
    expect(assinaturaValida(corpo, 'abc', 'segredo')).toBe(false);
    expect(assinaturaValida(corpo, '', 'segredo')).toBe(false);
  });
});

const base: PedidoApi = {
  id: 1001, number: 505, status: 'open', payment_status: 'paid', created_at: '2026-11-20T15:00:00-0300', paid_at: '2026-11-20T15:05:00-0300',
  subtotal: '300.00', discount: '30.00', coupon: [{ code: 'MARINA10' }], shipping_cost_customer: '19.90', total: '289.90',
  contact_email: 'Cliente@Exemplo.com ', shipping_address: { province: 'São Paulo' },
  products: [{ product_id: 55, name: 'Camisa', quantity: 2, price: '150.00' }],
};

describe('estadoDoPedido', () => {
  it('traduz pagamento e cancelamento', () => {
    expect(estadoDoPedido({ status: 'open', payment_status: 'paid' })).toBe('pago');
    expect(estadoDoPedido({ status: 'open', payment_status: 'pending' })).toBe('aberto');
    expect(estadoDoPedido({ status: 'open', payment_status: 'authorized' })).toBe('aberto');
    expect(estadoDoPedido({ status: 'cancelled', payment_status: 'pending' })).toBe('cancelado');
    expect(estadoDoPedido({ status: 'closed', payment_status: 'refunded' })).toBe('devolvido');
    expect(estadoDoPedido({ status: 'open', payment_status: 'partially_refunded' })).toBe('devolvido_parcial');
  });
  it('cancelado vale mais que pago (estorna igual)', () => {
    expect(estadoDoPedido({ status: 'cancelled', payment_status: 'paid' })).toBe('cancelado');
    expect(estadoDoPedido({ status: 'open', payment_status: 'voided' })).toBe('cancelado');
  });
});

describe('mapearPedido', () => {
  it('converte valores em centavos, e a base da comissão é subtotal menos desconto, sem frete (R-05)', () => {
    const p = mapearPedido(base);
    expect(p).toMatchObject({ subtotalCentavos: 30000, descontoCentavos: 3000, freteCentavos: 1990, totalCentavos: 28990, baseComissaoCentavos: 27000, estado: 'pago' });
  });
  it('lê número, cupom, e-mail em minúsculas, UF e itens', () => {
    const p = mapearPedido(base);
    expect(p.numero).toBe('505'); expect(p.cupom).toBe('MARINA10'); expect(p.emailComprador).toBe('cliente@exemplo.com');
    expect(p.ufComprador).toBe('SP');
    expect(p.itens).toEqual([{ produtoNuvemshopId: 55, nome: 'Camisa', quantidade: 2, precoUnitarioCentavos: 15000 }]);
    expect(p.pagoEm?.toISOString()).toBe('2026-11-20T18:05:00.000Z');
  });
  it('vários cupons ficam separados por vírgula, na ordem da Nuvemshop (R-02)', () => {
    expect(mapearPedido({ ...base, coupon: [{ code: 'FRETE' }, { code: 'MARINA10' }] }).cupom).toBe('FRETE,MARINA10');
    expect(mapearPedido({ ...base, coupon: [] }).cupom).toBeUndefined();
    expect(mapearPedido({ ...base, coupon: null }).cupom).toBeUndefined();
  });
  it('desconto maior que o subtotal não gera base negativa', () => {
    expect(mapearPedido({ ...base, subtotal: '50.00', discount: '80.00' }).baseComissaoCentavos).toBe(0);
  });
  it('usa discount_coupon quando discount vem vazio', () => {
    expect(mapearPedido({ ...base, discount: undefined, discount_coupon: '12.00' }).descontoCentavos).toBe(1200);
  });
  it('devolução total devolve toda a base; parcial usa o valor reembolsado, limitado à base', () => {
    expect(mapearPedido({ ...base, payment_status: 'refunded' }).devolvidoCentavos).toBe(27000);
    expect(mapearPedido({ ...base, payment_status: 'partially_refunded' }, 5000).devolvidoCentavos).toBe(5000);
    expect(mapearPedido({ ...base, payment_status: 'partially_refunded' }, 99999).devolvidoCentavos).toBe(27000);
    expect(mapearPedido(base, 5000).devolvidoCentavos).toBe(0);
  });
  it('pedido aberto não tem pagamento e cancelado guarda a data', () => {
    const aberto = mapearPedido({ ...base, payment_status: 'pending', paid_at: null });
    expect(aberto.estado).toBe('aberto'); expect(aberto.pagoEm).toBeUndefined();
    const canc = mapearPedido({ ...base, status: 'cancelled', cancelled_at: '2026-11-21T10:00:00-0300' });
    expect(canc.estado).toBe('cancelado'); expect(canc.canceladoEm).toBeInstanceOf(Date);
  });
  it('aguenta pedido quase vazio', () => {
    const p = mapearPedido({ id: 5, created_at: '2026-11-01T10:00:00Z' });
    expect(p).toMatchObject({ numero: '5', subtotalCentavos: 0, totalCentavos: 0, estado: 'aberto', itens: [] });
  });
});

describe('ufDaProvincia', () => {
  it('aceita sigla e nome do estado, com ou sem acento', () => {
    expect(ufDaProvincia('SP')).toBe('SP'); expect(ufDaProvincia('mg')).toBe('MG');
    expect(ufDaProvincia('São Paulo')).toBe('SP'); expect(ufDaProvincia('Paraná')).toBe('PR');
    expect(ufDaProvincia('Espírito Santo')).toBe('ES'); expect(ufDaProvincia('Distrito Federal')).toBe('DF');
  });
  it('devolve nada para o que não é estado', () => {
    expect(ufDaProvincia('XX')).toBeUndefined(); expect(ufDaProvincia('Buenos Aires')).toBeUndefined();
    expect(ufDaProvincia(null)).toBeUndefined(); expect(ufDaProvincia('')).toBeUndefined();
  });
});

describe('reembolsoDoHistorico', () => {
  it('soma só as diferenças negativas de pagamento', () => {
    expect(reembolsoDoHistorico([{ total_paid_diff: '100.00' }, { total_paid_diff: '-30.50' }, { total_paid_diff: '-10.00' }, {}])).toBe(4050);
  });
  it('aceita resposta vazia ou estranha', () => {
    expect(reembolsoDoHistorico([])).toBe(0); expect(reembolsoDoHistorico(null)).toBe(0); expect(reembolsoDoHistorico({})).toBe(0);
  });
});
