// Proteção das rotas de cron. Dono: M1.
// A Vercel Cron chama a rota com o cabeçalho "Authorization: Bearer <CRON_SECRET>".
// Uso numa rota (M4: api/cron/reconciliar, M10: api/cron/liberar):
//
//   export async function GET(req: Request) {
//     const negado = negarSeNaoForCron(req); if (negado) return negado;
//     ...
//   }
import { timingSafeEqual } from 'node:crypto';

export function cronAutorizado(req: Request): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const recebido = req.headers.get('authorization') ?? '';
  const esperado = `Bearer ${segredo}`;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Devolve a resposta 401 quando a chamada não veio do cron; undefined quando pode seguir. */
export function negarSeNaoForCron(req: Request): Response | undefined {
  if (cronAutorizado(req)) return undefined;
  return Response.json({ erro: 'não autorizado' }, { status: 401 });
}
