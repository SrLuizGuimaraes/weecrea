// Dados de campanhas e benefícios (M5). Hoje lê os dados de exemplo; depois, o banco.
import 'server-only';
import type { Campanha } from '@/contratos/tipos';
import { dados, perfilPrincipal } from '@/lib/dados-exemplo';

const vendaDoPedido = (p: { baseComissaoCentavos: number; devolvidoCentavos: number }) => Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos);
const pago = (p: { estado: string }) => p.estado === 'pago' || p.estado === 'devolvido_parcial';

export function resumoCampanha(k: Campanha) {
  const pedidos = dados.pedidos.filter((p) => p.campanhaId === k.id && pago(p));
  const realizado = pedidos.reduce((s, p) => s + vendaDoPedido(p), 0);
  const participantes = dados.participacoes.filter((p) => p.campanhaId === k.id && p.status === 'aceito').length;
  const convidados = dados.participacoes.filter((p) => p.campanhaId === k.id && p.status === 'convidado').length;
  const videos = dados.videos.filter((v) => v.campanhaId === k.id).length;
  const produtos = k.produtoIds.length ? k.produtoIds.map((id) => dados.produtos.find((p) => p.id === id)?.nome ?? id) : ['Todos os produtos'];
  const beneficios = k.beneficioIds.map((id) => dados.beneficios.find((b) => b.id === id)).filter((b) => !!b);
  return { campanha: k, realizado, pedidos: pedidos.length, participantes, convidados, videos, produtos, beneficios };
}

export type Aba = 'ativas' | 'futuras' | 'encerradas' | 'todas';

export function campanhasDaLoja(lojaId: string, aba: Aba) {
  return dados.campanhas.filter((k) => k.lojaId === lojaId).filter((k) =>
    aba === 'todas' ? true : aba === 'ativas' ? k.status === 'ativa' : aba === 'futuras' ? k.status === 'agendada' || k.status === 'rascunho'
      : k.status === 'encerrada' || k.status === 'cancelada').map(resumoCampanha);
}

export function beneficiosDaLoja(lojaId: string) {
  return dados.beneficios.filter((b) => b.lojaId === lojaId).map((b) => ({
    beneficio: b, emUso: dados.campanhas.filter((k) => k.beneficioIds.includes(b.id)).map((k) => k.nome),
  }));
}

export function campanhaDaLoja(lojaId: string, id: string) {
  const k = dados.campanhas.find((c) => c.id === id && c.lojaId === lojaId);
  if (!k) return undefined;
  const resumo = resumoCampanha(k);
  const participantes = dados.participacoes.filter((p) => p.campanhaId === k.id).map((p) => {
    const c = dados.creators.find((x) => x.id === p.creatorId)!;
    const vendas = dados.pedidos.filter((x) => x.campanhaId === k.id && x.creatorId === c.id && pago(x)).reduce((s, x) => s + vendaDoPedido(x), 0);
    return { participacao: p, creator: c, perfil: perfilPrincipal(c), vendas, videos: dados.videos.filter((v) => v.campanhaId === k.id && v.creatorId === c.id).length };
  }).sort((a, b) => b.vendas - a.vendas);
  const videos = dados.videos.filter((v) => v.campanhaId === k.id).map((v) => ({ video: v, creator: dados.creators.find((c) => c.id === v.creatorId) }));
  const convidaveis = dados.afiliacoes.filter((a) => a.lojaId === lojaId && a.status === 'aprovado' && !participantes.some((p) => p.creator.id === a.creatorId))
    .map((a) => dados.creators.find((c) => c.id === a.creatorId)!);
  return { ...resumo, participantes, videos, convidaveis };
}

export function opcoesDoFormulario(lojaId: string) {
  return {
    produtos: dados.produtos.filter((p) => p.lojaId === lojaId),
    beneficios: dados.beneficios.filter((b) => b.lojaId === lojaId),
    loja: dados.lojas.find((l) => l.id === lojaId)!,
  };
}

/** Campanhas do creator nas lojas em que está aprovado (R-35: abertas para todos; só convidados para os convidados). */
export function campanhasDoCreator(creatorId: string) {
  const lojas = dados.afiliacoes.filter((a) => a.creatorId === creatorId && (a.status === 'aprovado' || a.status === 'pausado')).map((a) => a.lojaId);
  return dados.campanhas.filter((k) => lojas.includes(k.lojaId) && k.status !== 'rascunho' && k.status !== 'cancelada')
    .filter((k) => k.visibilidade === 'aberta' || dados.participacoes.some((p) => p.campanhaId === k.id && p.creatorId === creatorId))
    .map((k) => {
      const part = dados.participacoes.find((p) => p.campanhaId === k.id && p.creatorId === creatorId);
      const minhasVendas = dados.pedidos.filter((p) => p.campanhaId === k.id && p.creatorId === creatorId && pago(p)).reduce((s, p) => s + vendaDoPedido(p), 0);
      return { ...resumoCampanha(k), loja: dados.lojas.find((l) => l.id === k.lojaId)!, participacao: part, minhasVendas };
    });
}
