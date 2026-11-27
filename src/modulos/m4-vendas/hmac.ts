// Conferência da assinatura dos webhooks da Nuvemshop (M4).
// Documentação: cabeçalho x-linkedstore-hmac-sha256, HMAC do CORPO ORIGINAL (bytes exatos, sem reformatar o JSON)
// com o client secret do app. O formato do valor (hexadecimal) não está explícito na documentação lida:
// aceitamos hexadecimal e base64, comparando em tempo constante.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const CABECALHO_HMAC = 'x-linkedstore-hmac-sha256';

export function assinaturaValida(corpoOriginal: string, recebida: string | null | undefined, clientSecret: string | undefined): boolean {
  if (!recebida || !clientSecret) return false;
  const h = createHmac('sha256', clientSecret).update(corpoOriginal, 'utf8');
  const bruto = h.digest();
  const valor = recebida.trim();
  const candidatos = [Buffer.from(bruto.toString('hex')), Buffer.from(bruto.toString('base64'))];
  const recebidoBuf = Buffer.from(/^[0-9a-f]+$/i.test(valor) ? valor.toLowerCase() : valor);
  return candidatos.some((c) => c.length === recebidoBuf.length && timingSafeEqual(c, recebidoBuf));
}
