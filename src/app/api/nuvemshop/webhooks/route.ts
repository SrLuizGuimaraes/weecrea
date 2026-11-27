// Recebe os avisos (webhooks) da Nuvemshop (M4): confere a assinatura, grava o aviso e responde rápido.
// A Nuvemshop espera 2xx em até 3 segundos e repete por até 48 horas; por isso o trabalho pesado roda depois da resposta
// (`after`) e o aviso fica gravado em AvisoWebhook com o resultado.
// Rota pública de propósito (a Nuvemshop não tem login); a proteção é a assinatura HMAC.
import { after } from 'next/server';
import { db } from '@/lib/db';
import { assinaturaValida, CABECALHO_HMAC } from '@/modulos/m4-vendas/hmac';
import { processarAviso } from '@/modulos/m4-vendas/pedidos-db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Precisa do corpo ORIGINAL para a assinatura: nada de req.json() antes.
  const corpoOriginal = await req.text();
  if (!assinaturaValida(corpoOriginal, req.headers.get(CABECALHO_HMAC), process.env.NUVEMSHOP_CLIENT_SECRET)) {
    return Response.json({ erro: 'assinatura inválida' }, { status: 401 });
  }
  let corpo: { store_id?: number | string; event?: string; id?: number | string };
  try { corpo = JSON.parse(corpoOriginal); } catch { return Response.json({ erro: 'corpo inválido' }, { status: 400 }); }
  const storeId = Number(corpo.store_id);
  if (!Number.isInteger(storeId) || typeof corpo.event !== 'string') return Response.json({ erro: 'aviso incompleto' }, { status: 400 });

  const loja = await db.loja.findUnique({ where: { nuvemshopStoreId: storeId }, select: { id: true } });
  const recursoId = Number(corpo.id);
  const aviso = await db.avisoWebhook.create({
    data: { storeId, lojaId: loja?.id ?? null, evento: corpo.event, recursoId: Number.isInteger(recursoId) ? recursoId : null, corpo: JSON.parse(corpoOriginal) },
  });
  after(() => processarAviso(aviso.id));
  return Response.json({ ok: true });
}
