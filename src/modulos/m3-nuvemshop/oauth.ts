// OAuth da Nuvemshop (M3): endereço de autorização, "state" assinado e troca do código pelo token.
// Fluxo da documentação: a loja abre /apps/{app_id}/authorize, aprova, e a Nuvemshop volta ao nosso endereço
// com ?code=... (vale 5 minutos). Trocamos o code por access_token em POST /apps/authorize/token.
// O token não expira: só fica inválido se a loja desinstalar ou se gerarmos outro para o mesmo app e loja.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const VALIDADE_STATE_MS = 10 * 60_000;

function segredo(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET não definido.');
  return s;
}

const assinar = (texto: string) => createHmac('sha256', segredo()).update(texto).digest('base64url');

/**
 * State do OAuth: liga a volta da Nuvemshop à loja que iniciou o fluxo e expira em 10 minutos.
 * Protege de alguém induzir uma loja logada a conectar a Nuvemshop de outra pessoa (CSRF).
 */
export function criarState(lojaId: string, agora = Date.now()): string {
  const corpo = `${lojaId}.${agora + VALIDADE_STATE_MS}.${randomBytes(8).toString('base64url')}`;
  return `${Buffer.from(corpo).toString('base64url')}.${assinar(corpo)}`;
}

/** Devolve o id da loja que iniciou o fluxo, ou undefined se o state for inválido ou tiver expirado. */
export function lerState(state: string | null | undefined, agora = Date.now()): string | undefined {
  if (!state) return undefined;
  const [b64, assinatura] = state.split('.');
  if (!b64 || !assinatura) return undefined;
  const corpo = Buffer.from(b64, 'base64url').toString('utf8');
  const esperado = Buffer.from(assinar(corpo));
  const recebido = Buffer.from(assinatura);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return undefined;
  const [lojaId, expira] = corpo.split('.');
  if (!lojaId || !expira || Number(expira) < agora) return undefined;
  return lojaId;
}

export function urlDeAutorizacao(state: string): string {
  const appId = process.env.NUVEMSHOP_APP_ID;
  if (!appId) throw new Error('NUVEMSHOP_APP_ID não definido.');
  return `https://www.nuvemshop.com.br/apps/${encodeURIComponent(appId)}/authorize?state=${encodeURIComponent(state)}`;
}

export interface TokenNuvemshop { accessToken: string; storeId: number; escopos: string }

export async function trocarCodigoPorToken(code: string, fetchImpl: typeof fetch = fetch): Promise<TokenNuvemshop> {
  const clientId = process.env.NUVEMSHOP_APP_ID, clientSecret = process.env.NUVEMSHOP_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('NUVEMSHOP_APP_ID e NUVEMSHOP_CLIENT_SECRET não definidos.');
  const resp = await fetchImpl('https://www.tiendanube.com/apps/authorize/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(process.env.NUVEMSHOP_USER_AGENT ? { 'User-Agent': process.env.NUVEMSHOP_USER_AGENT } : {}) },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code }),
  });
  if (!resp.ok) throw new Error(`A Nuvemshop recusou o código de autorização (${resp.status}). Tente conectar de novo.`);
  const j = (await resp.json()) as { access_token?: string; user_id?: string | number; store_id?: string | number; scope?: string };
  const storeId = Number(j.user_id ?? j.store_id);
  if (!j.access_token || !Number.isInteger(storeId)) throw new Error('Resposta inesperada da Nuvemshop ao trocar o código.');
  return { accessToken: j.access_token, storeId, escopos: j.scope ?? '' };
}
