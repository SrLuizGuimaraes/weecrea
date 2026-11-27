// Rota de cron de exemplo (M1): confere o segredo e o banco. Os crons de verdade são do M4 e do M10.
import { negarSeNaoForCron } from '@/lib/cron';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const negado = negarSeNaoForCron(req);
  if (negado) return negado;
  const lojas = await db.loja.count();
  return Response.json({ ok: true, lojas, em: new Date().toISOString() });
}
