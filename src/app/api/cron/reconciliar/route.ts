// Cron de reconciliação (M4): busca os pedidos que mudaram nos últimos 7 dias em cada loja conectada,
// para cobrir aviso perdido. Protegido pelo CRON_SECRET (a Vercel manda "Authorization: Bearer ...").
import { negarSeNaoForCron } from '@/lib/cron';
import { db } from '@/lib/db';
import { reconciliarPedidos } from '@/modulos/m4-vendas/pedidos-db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  const negado = negarSeNaoForCron(req);
  if (negado) return negado;
  const lojas = await db.loja.findMany({ where: { nuvemshopConectada: true, nuvemshopTokenCifrado: { not: null } }, select: { id: true } });
  const resultado: { lojaId: string; pedidos?: number; erro?: string }[] = [];
  for (const l of lojas) {
    try { resultado.push({ lojaId: l.id, pedidos: await reconciliarPedidos(l.id, 7) }); }
    catch (e) { console.error('[cron/reconciliar]', l.id, e); resultado.push({ lojaId: l.id, erro: e instanceof Error ? e.message.slice(0, 200) : 'erro' }); }
  }
  return Response.json({ ok: true, lojas: resultado, em: new Date().toISOString() });
}
