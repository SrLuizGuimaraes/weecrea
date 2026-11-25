// Cifrar e decifrar segredos guardados no banco (token da Nuvemshop, CPF e Pix). Dono: M1.
// AES-256-GCM com a chave CRIPTO_CHAVE (32 bytes em base64; gere com:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))").
// Formato guardado: "v1:<iv>:<tag>:<cifrado>" em base64url. Trocar a chave invalida o que já foi guardado.
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function chave(): Buffer {
  const texto = process.env.CRIPTO_CHAVE;
  if (!texto) throw new Error('CRIPTO_CHAVE não definida. Veja o .env.example.');
  const k = Buffer.from(texto, 'base64');
  if (k.length !== 32) throw new Error('CRIPTO_CHAVE precisa ter 32 bytes em base64.');
  return k;
}

export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', chave(), iv);
  const cifrado = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), cifrado.toString('base64url')].join(':');
}

export function decifrar(guardado: string): string {
  const [versao, iv, tag, cifrado] = guardado.split(':');
  if (versao !== 'v1' || !iv || !tag || cifrado === undefined) throw new Error('Valor cifrado em formato desconhecido.');
  const d = createDecipheriv('aes-256-gcm', chave(), Buffer.from(iv, 'base64url'));
  d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(cifrado, 'base64url')), d.final()]).toString('utf8');
}

/** Para mostrar CPF ou chave Pix sem revelar: "•••• 1234". */
export function mascarar(texto: string, visiveis = 4): string {
  return `•••• ${texto.slice(-visiveis)}`;
}
