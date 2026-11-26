// Dados de aprovação e creators da loja (M7). Hoje lê os dados de exemplo; depois, o banco.
import 'server-only';
import { dados, perfilPrincipal } from '@/lib/dados-exemplo';

const pago = (p: { estado: string }) => p.estado === 'pago' || p.estado === 'devolvido_parcial';

function linha(lojaId: string, a: (typeof dados.afiliacoes)[number]) {
  const c = dados.creators.find((x) => x.id === a.creatorId)!;
  const pedidos = dados.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId === c.id && pago(p));
  return {
    afiliacao: a, creator: c, perfil: perfilPrincipal(c),
    cupom: dados.cupons.find((x) => x.lojaId === lojaId && x.creatorId === c.id),
    videos: dados.videos.filter((v) => v.lojaId === lojaId && v.creatorId === c.id).length,
    pedidos: pedidos.length,
    vendas: pedidos.reduce((s, p) => s + Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos), 0),
  };
}

export function creatorsDaLoja(lojaId: string, aba: 'aprovacao' | 'ativos' | 'recusados') {
  const status = aba === 'aprovacao' ? ['pendente'] : aba === 'ativos' ? ['aprovado', 'pausado'] : ['recusado', 'removido'];
  return dados.afiliacoes.filter((a) => a.lojaId === lojaId && status.includes(a.status)).map((a) => linha(lojaId, a));
}

export function contagemPorAba(lojaId: string) {
  const daLoja = dados.afiliacoes.filter((a) => a.lojaId === lojaId);
  return {
    aprovacao: daLoja.filter((a) => a.status === 'pendente').length,
    ativos: daLoja.filter((a) => a.status === 'aprovado' || a.status === 'pausado').length,
    recusados: daLoja.filter((a) => a.status === 'recusado' || a.status === 'removido').length,
  };
}

export function perfilNaLoja(lojaId: string, creatorId: string) {
  const a = dados.afiliacoes.find((x) => x.lojaId === lojaId && x.creatorId === creatorId);
  if (!a) return undefined;
  const loja = dados.lojas.find((l) => l.id === lojaId)!;
  const r = linha(lojaId, a);
  const c = r.creator;
  const k = loja.criterios;
  const maiorSeguidores = Math.max(
    k.redesAceitas.includes('instagram') ? (c.instagram?.seguidores ?? 0) : 0,
    k.redesAceitas.includes('tiktok') ? (c.tiktok?.seguidores ?? 0) : 0);
  // Critérios para a tela (a regra oficial é src/dominio/criterios.ts, do M7)
  const criterios = [
    { nome: `Seguidores (mínimo ${k.seguidoresMin.toLocaleString('pt-BR')})`, ok: maiorSeguidores >= k.seguidoresMin },
    { nome: `Engajamento (mínimo ${(k.engajamentoMinBps / 100).toLocaleString('pt-BR')}%)`, ok: (c.engajamentoBps ?? 0) >= k.engajamentoMinBps },
    { nome: `Rede aceita (${k.redesAceitas.join(', ')})`, ok: k.redesAceitas.some((x) => (x === 'instagram' ? c.instagram : c.tiktok)) },
    ...(k.segmentosAceitos.length ? [{ nome: `Segmento (${k.segmentosAceitos.join(', ')})`, ok: c.segmentos.some((s) => k.segmentosAceitos.includes(s)) }] : []),
    ...(k.exigeTerProduto ? [{ nome: 'Já tem o produto', ok: a.temProduto }] : []),
  ];
  const campanhas = dados.participacoes.filter((p) => p.creatorId === creatorId)
    .map((p) => ({ p, k: dados.campanhas.find((x) => x.id === p.campanhaId && x.lojaId === lojaId) })).filter((x) => x.k);
  return { ...r, loja, criterios, campanhas };
}
