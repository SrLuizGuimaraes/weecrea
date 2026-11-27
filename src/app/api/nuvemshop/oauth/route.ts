// Conectar a Nuvemshop (M3). Duas etapas na mesma rota:
//   1. GET /api/nuvemshop/oauth            (loja logada) -> manda para a autorização da Nuvemshop, com um state assinado
//   2. GET /api/nuvemshop/oauth?code=&state= (volta da Nuvemshop) -> troca o code pelo token, guarda cifrado,
//      registra os webhooks e importa produtos e pedidos em segundo plano.
// Uma loja da Nuvemshop só pode estar ligada a uma loja nossa.
import { after, NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/acesso';
import { db } from '@/lib/db';
import { importarPedidos } from '@/modulos/m4-vendas/pedidos-db';
import { criarState, lerState, trocarCodigoPorToken, urlDeAutorizacao } from '@/modulos/m3-nuvemshop/oauth';
import { registrarWebhooks, salvarConexao, sincronizarProdutos } from '@/modulos/m3-nuvemshop/loja-nuvemshop';
import { criarCupomNaLoja } from '@/modulos/m3-nuvemshop/cupons-db';
import { urlDoApp } from '@/lib/link-senha';

export const dynamic = 'force-dynamic';

const voltar = (params: Record<string, string>) =>
  NextResponse.redirect(`${urlDoApp()}/loja/conexoes?${new URLSearchParams(params)}`);

export async function GET(req: Request) {
  const usuario = await usuarioAtual();
  if (!usuario || usuario.perfil !== 'LOJA' || !usuario.lojaId) return NextResponse.redirect(`${urlDoApp()}/entrar?voltar=/loja/conexoes`);
  const lojaId = usuario.lojaId;
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    try { return NextResponse.redirect(urlDeAutorizacao(criarState(lojaId))); }
    catch { return voltar({ erro: 'config' }); }
  }

  // Volta da Nuvemshop: o state tem de ser nosso, recente e da MESMA loja que está logada agora.
  if (lerState(url.searchParams.get('state')) !== lojaId) return voltar({ erro: 'state' });

  try {
    const { accessToken, storeId } = await trocarCodigoPorToken(code);
    const dona = await db.loja.findFirst({ where: { nuvemshopStoreId: storeId, id: { not: lojaId } }, select: { id: true } });
    if (dona) return voltar({ erro: 'em_uso' });
    await salvarConexao(lojaId, storeId, accessToken);
  } catch (e) {
    console.error('[nuvemshop/oauth]', e);
    return voltar({ erro: 'troca' });
  }

  // O resto demora (várias chamadas à API): roda depois de responder.
  after(async () => {
    try { await registrarWebhooks(lojaId); } catch (e) { console.error('[nuvemshop] webhooks', e); }
    try { await sincronizarProdutos(lojaId); } catch (e) { console.error('[nuvemshop] produtos', e); }
    try {
      // Cupons que estavam esperando a conexão.
      const pendentes = await db.cupom.findMany({ where: { lojaId, status: 'erro_sync', nuvemshopId: null }, select: { id: true } });
      for (const c of pendentes) await criarCupomNaLoja(c.id);
    } catch (e) { console.error('[nuvemshop] cupons', e); }
    try { await importarPedidos(lojaId, 90); } catch (e) { console.error('[nuvemshop] pedidos', e); }
  });
  return voltar({ aviso: 'conectada' });
}
