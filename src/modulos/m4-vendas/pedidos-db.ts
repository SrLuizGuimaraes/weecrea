// Pedidos no banco (M4): gravar o pedido vindo da Nuvemshop (sem duplicar), atribuir ao creator e à campanha,
// processar avisos de webhook, importar o histórico e reconciliar.
import 'server-only';
import type { Pedido } from '@/contratos/tipos';
import { atribuirPedido, ehAutocompra } from '@/dominio/atribuicao';
import { mapAfiliacao, mapCampanha, mapCreator, mapCupom, mapParticipacao } from '@/lib/dados-reais';
import { db } from '@/lib/db';
import { ClienteNuvemshop, ErroNuvemshop } from '@/modulos/m3-nuvemshop/cliente';
import { clienteDaLoja, gravarProduto, limparConexao, removerProduto } from '@/modulos/m3-nuvemshop/loja-nuvemshop';
import { aoGravarPedido } from './gancho-financeiro';
import { mapearPedido, reembolsoDoHistorico, type PedidoApi } from './pedido-mapa';

/** Tudo que a atribuição precisa da loja, carregado uma vez (e reaproveitado ao importar muitos pedidos). */
export async function contextoDaLoja(lojaId: string) {
  const [cupons, afiliacoes, creators, campanhas, participacoes, produtos] = await Promise.all([
    db.cupom.findMany({ where: { lojaId } }),
    db.afiliacao.findMany({ where: { lojaId } }),
    db.creator.findMany({ where: { afiliacoes: { some: { lojaId } } } }),
    db.campanha.findMany({ where: { lojaId } }),
    db.participacao.findMany({ where: { campanha: { lojaId } } }),
    db.produto.findMany({ where: { lojaId }, select: { id: true, nuvemshopId: true } }),
  ]);
  return {
    cupons: cupons.map(mapCupom), afiliacoes: afiliacoes.map(mapAfiliacao), creators: creators.map(mapCreator),
    campanhas: campanhas.map(mapCampanha), participacoes: participacoes.map(mapParticipacao),
    produtoPorNuvemshop: new Map(produtos.map((p) => [p.nuvemshopId, p.id])),
  };
}
export type ContextoLoja = Awaited<ReturnType<typeof contextoDaLoja>>;

/** Grava (ou atualiza) o pedido. O mesmo aviso repetido não duplica: a chave é (loja, id na Nuvemshop). Devolve o id nosso. */
export async function gravarPedidoDaApi(lojaId: string, o: PedidoApi, ctx: ContextoLoja, cliente: ClienteNuvemshop): Promise<string> {
  const base0 = mapearPedido(o);
  let reembolso = 0;
  if (base0.estado === 'devolvido_parcial') {
    reembolso = reembolsoDoHistorico(await cliente.get(`/orders/${o.id}/history/values`).catch(() => []));
  }
  const d = mapearPedido(o, reembolso);
  const itens = d.itens.map((i) => ({ ...i, produtoId: ctx.produtoPorNuvemshop.get(i.produtoNuvemshopId) }));

  const rascunho: Pedido = {
    id: '', lojaId, nuvemshopId: d.nuvemshopId, numero: d.numero, ...(d.cupom ? { cupom: d.cupom } : {}),
    itens: itens.map((i) => ({ produtoNuvemshopId: i.produtoNuvemshopId, ...(i.produtoId ? { produtoId: i.produtoId } : {}), nome: i.nome, quantidade: i.quantidade, precoUnitarioCentavos: i.precoUnitarioCentavos })),
    subtotalCentavos: d.subtotalCentavos, descontoCentavos: d.descontoCentavos, freteCentavos: d.freteCentavos, totalCentavos: d.totalCentavos,
    baseComissaoCentavos: d.baseComissaoCentavos, devolvidoCentavos: d.devolvidoCentavos, estado: d.estado,
    criadoEm: d.criadoEm.toISOString(), ...(d.pagoEm ? { pagoEm: d.pagoEm.toISOString() } : {}),
    ...(d.canceladoEm ? { canceladoEm: d.canceladoEm.toISOString() } : {}), autocompra: false, envioCreator: false,
  };
  const atribuir = (p: Pedido) => atribuirPedido(p, ctx.cupons, ctx.afiliacoes, ctx.creators, ctx.campanhas, ctx.participacoes);
  let resultado = atribuir(rascunho);
  // R-04: autocompra depende do e-mail do creator dono do cupom, que só se sabe depois da primeira atribuição.
  const dono = resultado.creatorId ? ctx.creators.find((c) => c.id === resultado.creatorId) : undefined;
  const autocompra = !!dono && ehAutocompra(d.emailComprador, dono);
  if (autocompra) resultado = atribuir({ ...rascunho, autocompra: true });

  const dados = {
    numero: d.numero, cupom: d.cupom ?? null, creatorId: resultado.creatorId ?? null, campanhaId: resultado.campanhaId ?? null,
    subtotalCentavos: d.subtotalCentavos, descontoCentavos: d.descontoCentavos, freteCentavos: d.freteCentavos, totalCentavos: d.totalCentavos,
    baseComissaoCentavos: d.baseComissaoCentavos, devolvidoCentavos: d.devolvidoCentavos,
    ufComprador: d.ufComprador ?? null, emailComprador: d.emailComprador ?? null, estado: d.estado,
    criadoEm: d.criadoEm, pagoEm: d.pagoEm ?? null, canceladoEm: d.canceladoEm ?? null, autocompra,
  };
  const pedido = await db.$transaction(async (tx) => {
    const p = await tx.pedido.upsert({
      where: { lojaId_nuvemshopId: { lojaId, nuvemshopId: d.nuvemshopId } },
      create: { lojaId, nuvemshopId: d.nuvemshopId, ...dados }, update: dados,
    });
    await tx.itemPedido.deleteMany({ where: { pedidoId: p.id } });
    await tx.itemPedido.createMany({
      data: itens.map((i) => ({ pedidoId: p.id, produtoNuvemshopId: i.produtoNuvemshopId, produtoId: i.produtoId ?? null, nome: i.nome, quantidade: i.quantidade, precoUnitarioCentavos: i.precoUnitarioCentavos })),
    });
    return p;
  });
  await aoGravarPedido({ pedidoId: pedido.id, lojaId, estado: d.estado, geraComissao: resultado.geraComissao, motivo: resultado.motivo });
  return pedido.id;
}

/** Busca o pedido completo na API e grava. */
export async function sincronizarPedido(lojaId: string, nuvemshopId: number): Promise<string> {
  const cliente = await clienteDaLoja(lojaId);
  const o = await cliente.get<PedidoApi>(`/orders/${nuvemshopId}`);
  return gravarPedidoDaApi(lojaId, o, await contextoDaLoja(lojaId), cliente);
}

/** Percorre os pedidos criados (importação inicial) ou alterados (reconciliação) desde uma data. Devolve quantos foram gravados. */
export async function sincronizarPedidosDesde(lojaId: string, desde: Date, por: 'created' | 'updated'): Promise<number> {
  const cliente = await clienteDaLoja(lojaId);
  const ctx = await contextoDaLoja(lojaId);
  const consulta = por === 'created' ? { created_at_min: desde.toISOString() } : { updated_at_min: desde.toISOString() };
  let n = 0;
  for await (const lote of cliente.paginas<PedidoApi>('/orders', consulta)) {
    for (const o of lote) {
      try { await gravarPedidoDaApi(lojaId, o, ctx, cliente); n += 1; }
      catch (e) { console.error(`[m4] pedido ${o.id} da loja ${lojaId}`, e); }
    }
  }
  return n;
}

const diasAtras = (dias: number) => new Date(Date.now() - dias * 86_400_000);
export const importarPedidos = (lojaId: string, dias = 90) => sincronizarPedidosDesde(lojaId, diasAtras(dias), 'created');
/** Cobre aviso perdido: pega tudo que mudou nos últimos dias. */
export const reconciliarPedidos = (lojaId: string, dias = 7) => sincronizarPedidosDesde(lojaId, diasAtras(dias), 'updated');

// ---------- Avisos (webhooks) ----------

const LGPD_STORE = new Set(['app/store_redact', 'store/redact']);
const LGPD_CLIENTE = new Set(['customer/redact', 'customers/redact']);
const LGPD_PEDIDO_DE_DADOS = new Set(['customers/data_request']);
export const ehEventoLgpd = (e: string) => LGPD_STORE.has(e) || LGPD_CLIENTE.has(e) || LGPD_PEDIDO_DE_DADOS.has(e);

/** Processa um aviso já gravado em AvisoWebhook. Nunca lança: o resultado (ok ou erro) fica registrado no próprio aviso. */
export async function processarAviso(avisoId: string): Promise<void> {
  const aviso = await db.avisoWebhook.findUnique({ where: { id: avisoId } });
  if (!aviso || aviso.processadoEm) return;
  try {
    const loja = await db.loja.findUnique({ where: { nuvemshopStoreId: aviso.storeId } });
    if (!loja) throw new Error('Loja da Nuvemshop desconhecida.');
    const corpo = (aviso.corpo ?? {}) as { id?: number; orders_to_redact?: number[] };
    const id = aviso.recursoId ?? corpo.id;

    if (aviso.evento.startsWith('order/') && id) {
      await sincronizarPedido(loja.id, id);
    } else if ((aviso.evento === 'product/created' || aviso.evento === 'product/updated') && id) {
      const cliente = await clienteDaLoja(loja.id);
      await gravarProduto(loja.id, await cliente.get(`/products/${id}`));
    } else if (aviso.evento === 'product/deleted' && id) {
      await removerProduto(loja.id, id);
    } else if (aviso.evento === 'app/uninstalled') {
      await limparConexao(loja.id);
    } else if (LGPD_CLIENTE.has(aviso.evento)) {
      // Apaga o e-mail de quem comprou nos pedidos indicados. O pedido em si fica (é registro financeiro).
      if (corpo.orders_to_redact?.length) await db.pedido.updateMany({ where: { lojaId: loja.id, nuvemshopId: { in: corpo.orders_to_redact } }, data: { emailComprador: null } });
    } else if (LGPD_STORE.has(aviso.evento)) {
      await limparConexao(loja.id);
      await db.pedido.updateMany({ where: { lojaId: loja.id }, data: { emailComprador: null } });
    }
    // customers/data_request e eventos que não usamos: só ficam registrados (a resposta ao pedido de dados é manual).
    await db.avisoWebhook.update({ where: { id: avisoId }, data: { lojaId: loja.id, processadoEm: new Date() } });
  } catch (e) {
    const msg = (e instanceof ErroNuvemshop ? `Nuvemshop ${e.status}` : e instanceof Error ? e.message : 'erro').slice(0, 300);
    console.error('[m4] aviso', avisoId, e);
    await db.avisoWebhook.update({ where: { id: avisoId }, data: { erro: msg } }).catch(() => {});
  }
}
