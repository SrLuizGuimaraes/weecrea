import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarState, lerState, trocarCodigoPorToken, urlDeAutorizacao } from './oauth';
import { mapearProduto } from './produto-mapa';

beforeEach(() => {
  vi.stubEnv('AUTH_SECRET', 'segredo-de-teste');
  vi.stubEnv('NUVEMSHOP_APP_ID', '1234');
  vi.stubEnv('NUVEMSHOP_CLIENT_SECRET', 'cs');
});
afterEach(() => vi.unstubAllEnvs());

describe('state do OAuth', () => {
  it('devolve a loja que iniciou o fluxo', () => { expect(lerState(criarState('loja-1'))).toBe('loja-1'); });
  it('expira em 10 minutos', () => {
    const t0 = 1_700_000_000_000;
    const s = criarState('loja-1', t0);
    expect(lerState(s, t0 + 9 * 60_000)).toBe('loja-1');
    expect(lerState(s, t0 + 11 * 60_000)).toBeUndefined();
  });
  it('recusa state adulterado, de outra chave ou vazio', () => {
    const s = criarState('loja-1');
    const [corpo, ass] = s.split('.');
    const outraLoja = Buffer.from(Buffer.from(corpo!, 'base64url').toString().replace('loja-1', 'loja-2')).toString('base64url');
    expect(lerState(`${outraLoja}.${ass}`)).toBeUndefined();
    vi.stubEnv('AUTH_SECRET', 'outro-segredo');
    expect(lerState(s)).toBeUndefined();
    expect(lerState('')).toBeUndefined();
    expect(lerState(null)).toBeUndefined();
    expect(lerState('lixo')).toBeUndefined();
  });
  it('cada state é diferente', () => { expect(criarState('l')).not.toBe(criarState('l')); });
});

describe('autorização', () => {
  it('monta o endereço com o app e o state', () => {
    const u = urlDeAutorizacao('abc');
    expect(u).toBe('https://www.nuvemshop.com.br/apps/1234/authorize?state=abc');
  });
  it('troca o código por token, mandando o corpo em JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ access_token: 'T', token_type: 'bearer', scope: 'read_orders', user_id: '789' })));
    const r = await trocarCodigoPorToken('codigo', fetchImpl as unknown as typeof fetch);
    expect(r).toEqual({ accessToken: 'T', storeId: 789, escopos: 'read_orders' });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://www.tiendanube.com/apps/authorize/token');
    expect(JSON.parse(init.body as string)).toEqual({ client_id: '1234', client_secret: 'cs', grant_type: 'authorization_code', code: 'codigo' });
  });
  it('falha com mensagem clara quando a Nuvemshop recusa', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 400 }));
    await expect(trocarCodigoPorToken('x', fetchImpl as unknown as typeof fetch)).rejects.toThrow(/recusou/);
  });
  it('falha se a resposta não traz token ou loja', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ access_token: 'T' })));
    await expect(trocarCodigoPorToken('x', fetchImpl as unknown as typeof fetch)).rejects.toThrow(/inesperada/);
  });
});

describe('mapearProduto', () => {
  it('lê nome por idioma, categoria, imagem e preço da primeira variante', () => {
    expect(mapearProduto({
      id: 55, name: { pt: 'Camisa de linho' }, categories: [{ name: { pt: 'Camisas' } }],
      images: [{ src: 'https://cdn/x.jpg' }], variants: [{ price: '189.90' }, { price: '199.90' }],
    })).toEqual({ nuvemshopId: 55, nome: 'Camisa de linho', categoria: 'Camisas', precoCentavos: 18990, imagemUrl: 'https://cdn/x.jpg' });
  });
  it('lida com produto sem categoria, imagem ou variante', () => {
    expect(mapearProduto({ id: 7 })).toEqual({ nuvemshopId: 7, nome: 'Produto 7', categoria: null, precoCentavos: 0, imagemUrl: null });
  });
});
