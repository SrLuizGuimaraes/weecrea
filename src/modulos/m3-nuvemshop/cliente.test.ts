import { describe, expect, it, vi } from 'vitest';
import { centavosDe, ClienteNuvemshop, ErroNuvemshop, textoI18n } from './cliente';

const resp = (corpo: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(corpo), { status: 200, headers: { 'content-type': 'application/json' }, ...init });

function criar(respostas: (Response | Error)[]) {
  const fetchImpl = vi.fn(async () => { const r = respostas.shift(); if (!r) throw new Error('sem resposta'); if (r instanceof Error) throw r; return r; });
  const esperas: number[] = [];
  const c = new ClienteNuvemshop({ storeId: 123, token: 'tok', userAgent: 'WEECREA (teste@exemplo.com)', fetchImpl: fetchImpl as unknown as typeof fetch, esperar: async (ms) => { esperas.push(ms); } });
  return { c, fetchImpl, esperas };
}

describe('ClienteNuvemshop', () => {
  it('monta a URL com versão e loja, e manda autenticação e User-Agent', async () => {
    const { c, fetchImpl } = criar([resp([{ id: 1 }])]);
    await c.get('/products', { page: 1, per_page: 50 });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(String(url)).toBe('https://api.nuvemshop.com.br/2025-03/123/products?page=1&per_page=50');
    const h = init.headers as Record<string, string>;
    expect(h.Authorization).toBe('Bearer tok');
    expect(h['User-Agent']).toBe('WEECREA (teste@exemplo.com)');
  });

  it('exige o User-Agent (a Nuvemshop responde 400 sem ele)', () => {
    const antes = process.env.NUVEMSHOP_USER_AGENT; delete process.env.NUVEMSHOP_USER_AGENT;
    expect(() => new ClienteNuvemshop({ storeId: 1, token: 't' })).toThrow(/USER_AGENT/);
    if (antes) process.env.NUVEMSHOP_USER_AGENT = antes;
  });

  it('manda Content-Type e corpo só quando há corpo', async () => {
    const { c, fetchImpl } = criar([resp({ id: 9 })]);
    await c.post('/coupons', { code: 'A10', type: 'percentage', value: '10' });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toContain('application/json');
    expect(init.body).toBe(JSON.stringify({ code: 'A10', type: 'percentage', value: '10' }));
  });

  it('tenta de novo em 429 esperando o x-rate-limit-reset', async () => {
    const { c, fetchImpl, esperas } = criar([resp({}, { status: 429, headers: { 'x-rate-limit-reset': '3000' } }), resp([{ id: 1 }])]);
    expect(await c.get('/orders')).toEqual([{ id: 1 }]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(esperas).toEqual([3000]);
  });

  it('em 429 nunca espera mais de 10 segundos', async () => {
    const { c, esperas } = criar([resp({}, { status: 429, headers: { 'x-rate-limit-reset': '60000' } }), resp({})]);
    await c.get('/orders');
    expect(esperas).toEqual([10_000]);
  });

  it('tenta de novo em 5xx e em falha de rede, e depois desiste', async () => {
    const { c, fetchImpl } = criar([resp({}, { status: 502 }), new Error('rede'), resp({}, { status: 503 }), resp({}, { status: 500 })]);
    await expect(c.get('/orders')).rejects.toBeInstanceOf(ErroNuvemshop);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('não repete erro de cliente (400, 401, 422)', async () => {
    for (const status of [400, 401, 422]) {
      const { c, fetchImpl } = criar([resp({ description: 'ruim' }, { status })]);
      await expect(c.get('/x')).rejects.toMatchObject({ status });
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    }
  });

  it('pagina até a última página e para quando vem menos que o tamanho', async () => {
    const pagina = (n: number, qtd: number) => resp(Array.from({ length: qtd }, (_, i) => ({ id: n * 1000 + i })));
    const { c, fetchImpl } = criar([pagina(1, 200), pagina(2, 200), pagina(3, 5)]);
    const todos = await c.listar('/products');
    expect(todos).toHaveLength(405);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    const urls = fetchImpl.mock.calls.map((x) => String((x as unknown as [URL])[0]));
    expect(urls[1]).toContain('page=2');
    expect(urls[0]).toContain('per_page=200');
  });

  it('trata 404 de lista (página além do fim) como fim da lista', async () => {
    const { c } = criar([resp({ code: 404, description: 'Last page is 0' }, { status: 404 })]);
    expect(await c.listar('/orders')).toEqual([]);
  });
});

describe('centavosDe', () => {
  it('converte texto, número e vazio', () => {
    expect(centavosDe('123.45')).toBe(12345);
    expect(centavosDe('0.10')).toBe(10);
    expect(centavosDe('19,9')).toBe(1990);
    expect(centavosDe(12.5)).toBe(1250);
    expect(centavosDe(undefined)).toBe(0);
    expect(centavosDe('')).toBe(0);
    expect(centavosDe('abc')).toBe(0);
  });
  it('não perde centavo por ponto flutuante', () => { expect(centavosDe('1.15')).toBe(115); expect(centavosDe('8.2')).toBe(820); });
});

describe('textoI18n', () => {
  it('prefere português e aceita texto simples', () => {
    expect(textoI18n({ es: 'Camiseta', pt: 'Camisa' })).toBe('Camisa');
    expect(textoI18n({ es: 'Camiseta' })).toBe('Camiseta');
    expect(textoI18n('Já é texto')).toBe('Já é texto');
    expect(textoI18n(undefined)).toBe('');
  });
});
