import { describe, expect, it } from 'vitest';
import type { Afiliacao, Campanha, Creator, Cupom, Participacao, Pedido } from '@/contratos/tipos';
import { atribuirPedido, calcularBaseComissao, codigosDoPedido, ehAutocompra } from './atribuicao';

const creator = (id: string, email = `${id}@ex.com`, bloqueado = false): Creator => ({
  id, usuarioId: `u-${id}`, nome: id, email, whatsapp: '', uf: 'SP', cidade: 'SP', bio: '', segmentos: [], bloqueado,
});
const cupom = (codigo: string, creatorId: string, lojaId = 'l1'): Cupom => ({ id: `cp-${codigo}`, lojaId, creatorId, codigo, status: 'ativo' });
const afiliacao = (creatorId: string, status: Afiliacao['status'] = 'aprovado', lojaId = 'l1'): Afiliacao => ({
  id: `a-${creatorId}`, lojaId, creatorId, status, origem: 'link', temProduto: false, falhasCriterios: [],
});
const campanha = (id: string, p: Partial<Campanha> = {}): Campanha => ({
  id, lojaId: 'l1', nome: id, produtoIds: [], inicio: '2026-11-01', fim: '2026-11-30', metaCentavos: 0, comissaoBps: 1000,
  visibilidade: 'aberta', entrega: 'publicar', briefing: '', tags: [], beneficioIds: [], status: 'ativa', ...p,
});
const aceite = (campanhaId: string, creatorId: string, aceitaEm = '2026-11-02T12:00:00Z'): Participacao => ({
  campanhaId, creatorId, status: 'aceito', aceitaEm,
});
const pedido = (p: Partial<Pedido> = {}): Pedido => ({
  id: 'o1', lojaId: 'l1', nuvemshopId: 1, numero: '1001', cupom: 'MARINA10',
  itens: [{ produtoNuvemshopId: 100, produtoId: 'p1', nome: 'Vestido', quantidade: 1, precoUnitarioCentavos: 10000 }],
  subtotalCentavos: 10000, descontoCentavos: 1000, freteCentavos: 2000, totalCentavos: 11000, baseComissaoCentavos: 9000,
  devolvidoCentavos: 0, estado: 'pago', criadoEm: '2026-11-10T13:00:00Z', pagoEm: '2026-11-10T13:05:00Z',
  autocompra: false, envioCreator: false, ...p,
});

const base = {
  cupons: [cupom('MARINA10', 'c1'), cupom('RAFA10', 'c2')],
  afiliacoes: [afiliacao('c1'), afiliacao('c2')],
  creators: [creator('c1', 'marina@ex.com'), creator('c2')],
};
const atribuir = (p: Pedido, extra: { campanhas?: Campanha[]; participacoes?: Participacao[]; afiliacoes?: Afiliacao[]; creators?: Creator[]; cupons?: Cupom[] } = {}) =>
  atribuirPedido(p, extra.cupons ?? base.cupons, extra.afiliacoes ?? base.afiliacoes, extra.creators ?? base.creators,
    extra.campanhas ?? [], extra.participacoes ?? []);

describe('R-05 calcularBaseComissao', () => {
  it('subtotal menos desconto, sem frete', () => {
    expect(calcularBaseComissao({ subtotalCentavos: 10000, descontoCentavos: 1000 })).toBe(9000);
  });
  it('nunca negativa (desconto maior que o subtotal)', () => {
    expect(calcularBaseComissao({ subtotalCentavos: 5000, descontoCentavos: 8000 })).toBe(0);
  });
});

describe('R-01 venda atribuída', () => {
  it('o pedido pertence ao dono do cupom', () => {
    expect(atribuir(pedido())).toMatchObject({ creatorId: 'c1', geraComissao: true });
  });
  it('compara o código sem diferenciar maiúsculas', () => {
    expect(atribuir(pedido({ cupom: 'marina10' })).creatorId).toBe('c1');
    expect(atribuir(pedido({ cupom: ' Marina10 ' })).creatorId).toBe('c1');
  });
  it('sem cupom de creator, fica sem creator', () => {
    const outro = atribuir(pedido({ cupom: 'BLACKFRIDAY' }));
    expect(outro.creatorId).toBeUndefined();
    expect(outro.geraComissao).toBe(false);
    const semCupom = pedido();
    delete semCupom.cupom;
    const r = atribuir(semCupom);
    expect(r.creatorId).toBeUndefined();
    expect(r.geraComissao).toBe(false);
  });
  it('não usa cupom de outra loja', () => {
    expect(atribuir(pedido(), { cupons: [cupom('MARINA10', 'c1', 'l2')] }).creatorId).toBeUndefined();
  });
});

describe('R-02 vários cupons', () => {
  it('vale o primeiro que for de um creator', () => {
    expect(atribuir(pedido({ cupom: 'FRETEGRATIS,RAFA10,MARINA10' })).creatorId).toBe('c2');
  });
  it('lê a lista do pedido', () => {
    expect(codigosDoPedido({ cupom: 'A, b ,,C' })).toEqual(['A', 'B', 'C']);
  });
});

describe('R-03 afiliação e bloqueio', () => {
  it('aprovado ou pausado gera comissão', () => {
    expect(atribuir(pedido(), { afiliacoes: [afiliacao('c1', 'pausado')] }).geraComissao).toBe(true);
  });
  it('removido, recusado ou pendente não gera, mas o pedido continua do creator', () => {
    for (const status of ['removido', 'recusado', 'pendente'] as const) {
      const r = atribuir(pedido(), { afiliacoes: [afiliacao('c1', status)] });
      expect(r).toMatchObject({ creatorId: 'c1', geraComissao: false });
      expect(r.motivo).toBeTruthy();
    }
  });
  it('sem afiliação na loja não gera', () => {
    expect(atribuir(pedido(), { afiliacoes: [] }).geraComissao).toBe(false);
  });
  it('creator bloqueado não gera', () => {
    expect(atribuir(pedido(), { creators: [creator('c1', 'm@ex.com', true)] }).geraComissao).toBe(false);
  });
});

describe('R-04 autocompra', () => {
  it('mesmo e-mail do creator é autocompra, sem diferenciar maiúsculas', () => {
    expect(ehAutocompra(' Marina@Ex.com ', creator('c1', 'marina@ex.com'))).toBe(true);
    expect(ehAutocompra('outra@ex.com', creator('c1', 'marina@ex.com'))).toBe(false);
    expect(ehAutocompra(undefined, creator('c1'))).toBe(false);
  });
  it('pedido marcado como autocompra não gera comissão', () => {
    expect(atribuir(pedido({ autocompra: true }))).toMatchObject({ creatorId: 'c1', geraComissao: false });
  });
});

describe('só pedido pago gera comissão', () => {
  it('aberto ou cancelado não gera', () => {
    const aberto = pedido({ estado: 'aberto' });
    delete aberto.pagoEm;
    expect(atribuir(aberto).geraComissao).toBe(false);
    expect(atribuir(pedido({ estado: 'cancelado' })).geraComissao).toBe(false);
  });
});

describe('R-06 campanha do pedido', () => {
  const k1 = campanha('k1');
  it('campanha ativa, creator aceito antes do pagamento, data dentro do período', () => {
    expect(atribuir(pedido(), { campanhas: [k1], participacoes: [aceite('k1', 'c1')] }).campanhaId).toBe('k1');
  });
  it('pedido pago antes do aceite fica sem campanha', () => {
    expect(atribuir(pedido(), { campanhas: [k1], participacoes: [aceite('k1', 'c1', '2026-11-11T00:00:00Z')] }).campanhaId).toBeUndefined();
  });
  it('creator só convidado não entra', () => {
    expect(atribuir(pedido(), { campanhas: [k1], participacoes: [{ campanhaId: 'k1', creatorId: 'c1', status: 'convidado' }] }).campanhaId).toBeUndefined();
  });
  it('pagamento fora do período não entra (usa o dia de São Paulo)', () => {
    const k = campanha('k', { inicio: '2026-11-11', fim: '2026-11-30' });
    expect(atribuir(pedido(), { campanhas: [k], participacoes: [aceite('k', 'c1')] }).campanhaId).toBeUndefined();
    // 10/11 às 23h30 em São Paulo = 11/11 02:30 UTC: ainda é dia 10, fora do período
    expect(atribuir(pedido({ pagoEm: '2026-11-11T02:30:00Z' }), { campanhas: [k], participacoes: [aceite('k', 'c1')] }).campanhaId).toBeUndefined();
    expect(atribuir(pedido({ pagoEm: '2026-11-11T03:30:00Z' }), { campanhas: [k], participacoes: [aceite('k', 'c1')] }).campanhaId).toBe('k');
  });
  it('precisa de ao menos um item entre os produtos da campanha', () => {
    const k = campanha('k', { produtoIds: ['p9'] });
    expect(atribuir(pedido(), { campanhas: [k], participacoes: [aceite('k', 'c1')] }).campanhaId).toBeUndefined();
    const k2 = campanha('k2', { produtoIds: ['p9', 'p1'] });
    expect(atribuir(pedido(), { campanhas: [k2], participacoes: [aceite('k2', 'c1')] }).campanhaId).toBe('k2');
  });
  it('campanha sem produtos vale para todos', () => {
    expect(atribuir(pedido(), { campanhas: [campanha('k', { produtoIds: [] })], participacoes: [aceite('k', 'c1')] }).campanhaId).toBe('k');
  });
  it('rascunho, cancelada ou de outra loja não entram', () => {
    for (const k of [campanha('k', { status: 'rascunho' }), campanha('k', { status: 'cancelada' }), campanha('k', { lojaId: 'l2' })]) {
      expect(atribuir(pedido(), { campanhas: [k], participacoes: [aceite('k', 'c1')] }).campanhaId).toBeUndefined();
    }
  });
  it('empate: maior comissão; depois, a que começou antes', () => {
    const a = campanha('a', { comissaoBps: 1000, inicio: '2026-11-01' });
    const b = campanha('b', { comissaoBps: 1500, inicio: '2026-11-05' });
    const c = campanha('c', { comissaoBps: 1500, inicio: '2026-11-03' });
    const part = ['a', 'b', 'c'].map((k) => aceite(k, 'c1'));
    expect(atribuir(pedido(), { campanhas: [a, b, c], participacoes: part }).campanhaId).toBe('c');
  });
  it('mesmo sem gerar comissão, guarda a campanha para o painel', () => {
    expect(atribuir(pedido({ autocompra: true }), { campanhas: [k1], participacoes: [aceite('k1', 'c1')] }))
      .toMatchObject({ creatorId: 'c1', campanhaId: 'k1', geraComissao: false });
  });
});
