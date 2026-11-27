// Cliente único da API da Nuvemshop (M3). Respeita o limite de requisições e tenta de novo em 429 e 5xx.
// Documentação lida em nuvemshop.dev (versão 2025-03, marcada como "legacy"; a estável atual é a 2026-11,
// que não conseguimos abrir): troque NUVEMSHOP_API_VERSION quando for migrar.
//   - Base: https://api.nuvemshop.com.br/{versão}/{store_id}
//   - Cabeçalhos: Authorization: Bearer <token>, User-Agent obrigatório, Content-Type: application/json; charset=utf-8
//   - Limite: leaky bucket de 40 requisições, 2 por segundo (x10 nas lojas Next/Evolution). 429 quando estoura.
//   - Paginação: per_page até 200, page a partir de 1. Em listas, página sem resultado pode vir como 404.
// Este arquivo não usa banco nem 'server-only' de propósito: os testes injetam fetch e espera.

export class ErroNuvemshop extends Error {
  constructor(mensagem: string, readonly status: number, readonly corpo?: unknown) {
    super(mensagem);
    this.name = 'ErroNuvemshop';
  }
}

export interface OpcoesCliente {
  storeId: number | string;
  token: string;
  /** Padrão: NUVEMSHOP_USER_AGENT. A Nuvemshop responde 400 sem ele. */
  userAgent?: string;
  versao?: string;
  base?: string;
  maxTentativas?: number;
  fetchImpl?: typeof fetch;
  esperar?: (ms: number) => Promise<void>;
}

type Consulta = Record<string, string | number | boolean | undefined>;

const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class ClienteNuvemshop {
  private readonly raiz: string;
  private readonly userAgent: string;
  private readonly maxTentativas: number;
  private readonly fetchImpl: typeof fetch;
  private readonly esperar: (ms: number) => Promise<void>;

  constructor(private readonly o: OpcoesCliente) {
    const ua = o.userAgent ?? process.env.NUVEMSHOP_USER_AGENT;
    if (!ua) throw new Error('NUVEMSHOP_USER_AGENT não definido. A Nuvemshop exige o User-Agent com o contato do app.');
    this.userAgent = ua;
    const versao = o.versao ?? process.env.NUVEMSHOP_API_VERSION ?? '2025-03';
    this.raiz = `${o.base ?? 'https://api.nuvemshop.com.br'}/${versao}/${o.storeId}`;
    this.maxTentativas = o.maxTentativas ?? 4;
    this.fetchImpl = o.fetchImpl ?? fetch;
    this.esperar = o.esperar ?? dormir;
  }

  /** Uma chamada, com novas tentativas em 429, 5xx e falha de rede. Devolve o JSON e os cabeçalhos. */
  async requisitar<T = unknown>(metodo: 'GET' | 'POST' | 'PUT' | 'DELETE', caminho: string, opcoes: { consulta?: Consulta; corpo?: unknown } = {}): Promise<{ dado: T; cabecalhos: Headers }> {
    const url = new URL(`${this.raiz}${caminho}`);
    for (const [k, v] of Object.entries(opcoes.consulta ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));
    let ultimoErro: ErroNuvemshop | Error | undefined;
    for (let tentativa = 0; tentativa < this.maxTentativas; tentativa++) {
      let resp: Response;
      try {
        resp = await this.fetchImpl(url, {
          method: metodo,
          headers: {
            Authorization: `Bearer ${this.o.token}`, 'User-Agent': this.userAgent,
            ...(opcoes.corpo !== undefined ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
          },
          ...(opcoes.corpo !== undefined ? { body: JSON.stringify(opcoes.corpo) } : {}),
        });
      } catch (e) {
        ultimoErro = e instanceof Error ? e : new Error('Falha de rede');
        await this.esperar(500 * 2 ** tentativa);
        continue;
      }
      if (resp.ok) {
        const texto = await resp.text();
        return { dado: (texto ? JSON.parse(texto) : {}) as T, cabecalhos: resp.headers };
      }
      const corpo = await resp.json().catch(() => undefined);
      const erro = new ErroNuvemshop(`Nuvemshop respondeu ${resp.status} em ${metodo} ${caminho}`, resp.status, corpo);
      if (resp.status === 429) {
        // x-rate-limit-reset: milissegundos até o balde esvaziar. Esperamos no máximo 10 s por tentativa.
        const reset = Number(resp.headers.get('x-rate-limit-reset'));
        const retry = Number(resp.headers.get('retry-after')) * 1000;
        ultimoErro = erro;
        await this.esperar(Math.min(10_000, Math.max(1000, Number.isFinite(reset) ? reset : 0, Number.isFinite(retry) ? retry : 0)));
        continue;
      }
      if (resp.status >= 500) { ultimoErro = erro; await this.esperar(500 * 2 ** tentativa); continue; }
      throw erro; // 4xx (menos 429): não adianta repetir
    }
    throw ultimoErro ?? new Error('Falha ao falar com a Nuvemshop');
  }

  get<T = unknown>(caminho: string, consulta?: Consulta) { return this.requisitar<T>('GET', caminho, { consulta }).then((r) => r.dado); }
  post<T = unknown>(caminho: string, corpo: unknown) { return this.requisitar<T>('POST', caminho, { corpo }).then((r) => r.dado); }
  put<T = unknown>(caminho: string, corpo: unknown) { return this.requisitar<T>('PUT', caminho, { corpo }).then((r) => r.dado); }
  delete(caminho: string) { return this.requisitar('DELETE', caminho).then((r) => r.dado); }

  /** Lista paginada (200 por página). Uma página fora do fim, que a Nuvemshop devolve como 404, encerra a lista. */
  async *paginas<T>(caminho: string, consulta: Consulta = {}, porPagina = 200): AsyncGenerator<T[]> {
    for (let page = 1; ; page++) {
      let itens: T[];
      try {
        itens = await this.get<T[]>(caminho, { ...consulta, page, per_page: porPagina });
      } catch (e) {
        if (e instanceof ErroNuvemshop && e.status === 404) return;
        throw e;
      }
      if (!Array.isArray(itens) || itens.length === 0) return;
      yield itens;
      if (itens.length < porPagina) return;
    }
  }

  async listar<T>(caminho: string, consulta: Consulta = {}, limite = 10_000): Promise<T[]> {
    const todos: T[] = [];
    for await (const lote of this.paginas<T>(caminho, consulta)) {
      todos.push(...lote);
      if (todos.length >= limite) break; // a API limita a 10.000 itens por consulta
    }
    return todos;
  }
}

/** Valor da API ("123.45", 123.45 ou nulo) em centavos inteiros. */
export function centavosDe(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined || valor === '') return 0;
  const n = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Texto que a Nuvemshop devolve por idioma ({"pt": "Camiseta"}) ou simples. Prefere o português. */
export function textoI18n(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const achado = o.pt ?? o['pt-BR'] ?? Object.values(o).find((x) => typeof x === 'string' && x);
    return typeof achado === 'string' ? achado : '';
  }
  return '';
}
