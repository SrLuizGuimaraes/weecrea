// Dados de aprovação e creators da loja (M7). Hoje lê os dados de exemplo; depois, o banco.
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { perfilPrincipal } from '@/lib/demo/util';

const pago = (p: { estado: string }) => p.estado === 'pago' || p.estado === 'devolvido_parcial';

function linha(D: DadosExemplo, lojaId: string, a: (typeof D.afiliacoes)[number]) {
  const c = D.creators.find((x) => x.id === a.creatorId)!;
  const pedidos = D.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId === c.id && pago(p));
  return {
    afiliacao: a, creator: c, perfil: perfilPrincipal(c),
    cupom: D.cupons.find((x) => x.lojaId === lojaId && x.creatorId === c.id),
    videos: D.videos.filter((v) => v.lojaId === lojaId && v.creatorId === c.id).length,
    pedidos: pedidos.length,
    vendas: pedidos.reduce((s, p) => s + Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos), 0),
  };
}

export function creatorsDaLoja(D: DadosExemplo, lojaId: string, aba: 'aprovacao' | 'ativos' | 'recusados') {
  const status = aba === 'aprovacao' ? ['pendente'] : aba === 'ativos' ? ['aprovado', 'pausado'] : ['recusado', 'removido'];
  return D.afiliacoes.filter((a) => a.lojaId === lojaId && status.includes(a.status)).map((a) => linha(D, lojaId, a));
}

export function contagemPorAba(D: DadosExemplo, lojaId: string) {
  const daLoja = D.afiliacoes.filter((a) => a.lojaId === lojaId);
  return {
    aprovacao: daLoja.filter((a) => a.status === 'pendente').length,
    ativos: daLoja.filter((a) => a.status === 'aprovado' || a.status === 'pausado').length,
    recusados: daLoja.filter((a) => a.status === 'recusado' || a.status === 'removido').length,
  };
}

export function perfilNaLoja(D: DadosExemplo, lojaId: string, creatorId: string) {
  const a = D.afiliacoes.find((x) => x.lojaId === lojaId && x.creatorId === creatorId);
  if (!a) return undefined;
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  const r = linha(D, lojaId, a);
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
  const campanhas = D.participacoes.filter((p) => p.creatorId === creatorId)
    .map((p) => ({ p, k: D.campanhas.find((x) => x.id === p.campanhaId && x.lojaId === lojaId) })).filter((x) => x.k);
  return { ...r, loja, criterios, campanhas };
}
