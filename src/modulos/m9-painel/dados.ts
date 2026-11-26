// Dados do painel de vendas (M9). Hoje lê os dados de exemplo; depois, o banco.
import 'server-only';
import type { Centavos } from '@/contratos/tipos';
import { dados, HOJE_EXEMPLO } from '@/lib/dados-exemplo';
import { diaEmSaoPaulo, somarDias } from '@/lib/datas';

export interface FiltroPainel { de: string; ate: string; creatorId?: string; dias?: number }

/** Lê os filtros da URL: ?dias=7|30|90, ou ?de=&ate=, e ?creator=. */
export function lerFiltro(p: { dias?: string; de?: string; ate?: string; creator?: string }): FiltroPainel {
  const creatorId = p.creator || undefined;
  if (p.de && p.ate && /^\d{4}-\d{2}-\d{2}$/.test(p.de) && /^\d{4}-\d{2}-\d{2}$/.test(p.ate)) {
    return { de: p.de <= p.ate ? p.de : p.ate, ate: p.de <= p.ate ? p.ate : p.de, ...(creatorId ? { creatorId } : {}) };
  }
  const dias = [7, 30, 90].includes(Number(p.dias)) ? Number(p.dias) : 30;
  return { de: somarDias(HOJE_EXEMPLO, -(dias - 1)), ate: HOJE_EXEMPLO, dias, ...(creatorId ? { creatorId } : {}) };
}

const valorVenda = (p: { baseComissaoCentavos: Centavos; devolvidoCentavos: Centavos }) => Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos);

/** Pedidos pagos (que contam venda) de uma loja, atribuídos a creator, no período. */
function pedidosPagos(lojaId: string, f: FiltroPainel) {
  return dados.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId && p.pagoEm
    && (p.estado === 'pago' || p.estado === 'devolvido_parcial')
    && (!f.creatorId || p.creatorId === f.creatorId)
    && diaEmSaoPaulo(p.pagoEm) >= f.de && diaEmSaoPaulo(p.pagoEm) <= f.ate);
}

export function painelDaLoja(lojaId: string, f: FiltroPainel) {
  const pedidos = pedidosPagos(lojaId, f);
  const vendas = pedidos.reduce((s, p) => s + valorVenda(p), 0);
  const creatorsAtivos = dados.afiliacoes.filter((a) => a.lojaId === lojaId && a.status === 'aprovado').length;
  const videos = dados.videos.filter((v) => v.lojaId === lojaId && (!f.creatorId || v.creatorId === f.creatorId)
    && diaEmSaoPaulo(v.enviadoEm) >= f.de && diaEmSaoPaulo(v.enviadoEm) <= f.ate).length;
  const aPagar = dados.comissoes.filter((c) => c.lojaId === lojaId && c.status === 'liberada' && !c.retida
    && (!f.creatorId || c.creatorId === f.creatorId)).reduce((s, c) => s + c.valorCentavos, 0);

  // Série por dia (ou por semana acima de 45 dias)
  const totalDias = Math.round((Date.parse(f.ate) - Date.parse(f.de)) / 86400000) + 1;
  const porSemana = totalDias > 45;
  const serie: { rotulo: string; valor: number }[] = [];
  for (let d = f.de; d <= f.ate; d = somarDias(d, porSemana ? 7 : 1)) {
    const fim = porSemana ? somarDias(d, 6) : d;
    const valor = pedidos.filter((p) => { const dia = diaEmSaoPaulo(p.pagoEm!); return dia >= d && dia <= fim; }).reduce((s, p) => s + valorVenda(p), 0);
    serie.push({ rotulo: `${d.slice(8, 10)}/${d.slice(5, 7)}`, valor });
  }

  // Ranking de creators
  const porCreator = new Map<string, { vendas: number; pedidos: number }>();
  for (const p of pedidos) {
    const r = porCreator.get(p.creatorId!) ?? { vendas: 0, pedidos: 0 };
    r.vendas += valorVenda(p); r.pedidos += 1; porCreator.set(p.creatorId!, r);
  }
  const rankingCreators = [...porCreator].map(([creatorId, r]) => ({
    creatorId, nome: dados.creators.find((c) => c.id === creatorId)?.nome ?? creatorId,
    cupom: dados.cupons.find((c) => c.creatorId === creatorId && c.lojaId === lojaId)?.codigo ?? '—', ...r,
  })).sort((a, b) => b.vendas - a.vendas);

  // Produtos mais vendidos (soma dos itens)
  const porProduto = new Map<string, { nome: string; quantidade: number; valor: number }>();
  for (const p of pedidos) for (const i of p.itens) {
    const chave = i.produtoId ?? String(i.produtoNuvemshopId);
    const r = porProduto.get(chave) ?? { nome: i.nome, quantidade: 0, valor: 0 };
    r.quantidade += i.quantidade; r.valor += i.quantidade * i.precoUnitarioCentavos; porProduto.set(chave, r);
  }
  const produtos = [...porProduto.values()].sort((a, b) => b.quantidade - a.quantidade || b.valor - a.valor);

  // Estados dos creators aprovados
  const ufs: Record<string, number> = {};
  for (const a of dados.afiliacoes.filter((x) => x.lojaId === lojaId && x.status === 'aprovado')) {
    const uf = dados.creators.find((c) => c.id === a.creatorId)?.uf;
    if (uf) ufs[uf] = (ufs[uf] ?? 0) + 1;
  }

  const creatorsDoFiltro = dados.afiliacoes.filter((a) => a.lojaId === lojaId && (a.status === 'aprovado' || a.status === 'pausado'))
    .map((a) => ({ id: a.creatorId, nome: dados.creators.find((c) => c.id === a.creatorId)?.nome ?? a.creatorId }));

  return {
    indicadores: { vendas, pedidos: pedidos.length, ticket: pedidos.length ? Math.round(vendas / pedidos.length) : 0, creatorsAtivos, videos, aPagar },
    serie, porSemana, rankingCreators, produtos, ufs, creatorsDoFiltro,
  };
}

/** Início do creator: cupons, números do mês, posição no ranking, metas e convites. */
export function inicioDoCreator(creatorId: string, lojaId?: string) {
  const lojas = dados.afiliacoes.filter((a) => a.creatorId === creatorId && (a.status === 'aprovado' || a.status === 'pausado'))
    .map((a) => dados.lojas.find((l) => l.id === a.lojaId)!).filter(Boolean);
  const loja = lojas.find((l) => l.id === lojaId) ?? lojas[0];
  if (!loja) return { lojas, loja: undefined };
  const inicioMes = `${HOJE_EXEMPLO.slice(0, 8)}01`;
  const f: FiltroPainel = { de: inicioMes, ate: HOJE_EXEMPLO };
  const todos = pedidosPagos(loja.id, f);
  const meus = todos.filter((p) => p.creatorId === creatorId);
  const vendas = meus.reduce((s, p) => s + valorVenda(p), 0);
  const ranking = [...new Set(todos.map((p) => p.creatorId!))]
    .map((id) => ({ id, v: todos.filter((p) => p.creatorId === id).reduce((s, p) => s + valorVenda(p), 0) }))
    .sort((a, b) => b.v - a.v);
  const posicao = ranking.findIndex((r) => r.id === creatorId) + 1;
  const comissaoMes = dados.comissoes.filter((c) => c.creatorId === creatorId && c.lojaId === loja.id && c.status !== 'estornada'
    && meus.some((p) => p.id === c.pedidoId)).reduce((s, c) => s + c.valorCentavos, 0);
  const metas = dados.participacoes.filter((p) => p.creatorId === creatorId && p.status === 'aceito')
    .map((p) => dados.campanhas.find((k) => k.id === p.campanhaId)!)
    .filter((k) => k && k.lojaId === loja.id && k.status === 'ativa' && k.metaIndividualCentavos)
    .map((k) => ({
      campanha: k, meta: k.metaIndividualCentavos!,
      realizado: dados.pedidos.filter((p) => p.campanhaId === k.id && p.creatorId === creatorId && (p.estado === 'pago' || p.estado === 'devolvido_parcial'))
        .reduce((s, p) => s + valorVenda(p), 0),
    }));
  const convites = dados.participacoes.filter((p) => p.creatorId === creatorId && p.status === 'convidado')
    .map((p) => dados.campanhas.find((k) => k.id === p.campanhaId)!).filter((k) => k && k.lojaId === loja.id);
  const cupom = dados.cupons.find((c) => c.creatorId === creatorId && c.lojaId === loja.id);
  return { lojas, loja, cupom, vendas, pedidos: meus.length, comissaoMes, posicao, totalRanking: ranking.length, metas, convites };
}
