// Dados de campanhas e benefícios (M5). Hoje lê os dados de exemplo; depois, o banco.
import type { Campanha } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { perfilPrincipal } from '@/lib/demo/util';

const vendaDoPedido = (p: { baseComissaoCentavos: number; devolvidoCentavos: number }) => Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos);
const pago = (p: { estado: string }) => p.estado === 'pago' || p.estado === 'devolvido_parcial';

export function resumoCampanha(D: DadosExemplo, k: Campanha) {
  const pedidos = D.pedidos.filter((p) => p.campanhaId === k.id && pago(p));
  const realizado = pedidos.reduce((s, p) => s + vendaDoPedido(p), 0);
  const participantes = D.participacoes.filter((p) => p.campanhaId === k.id && p.status === 'aceito').length;
  const convidados = D.participacoes.filter((p) => p.campanhaId === k.id && p.status === 'convidado').length;
  const videos = D.videos.filter((v) => v.campanhaId === k.id).length;
  const produtos = k.produtoIds.length ? k.produtoIds.map((id) => D.produtos.find((p) => p.id === id)?.nome ?? id) : ['Todos os produtos'];
  const beneficios = k.beneficioIds.map((id) => D.beneficios.find((b) => b.id === id)).filter((b) => !!b);
  return { campanha: k, realizado, pedidos: pedidos.length, participantes, convidados, videos, produtos, beneficios };
}

export type Aba = 'ativas' | 'futuras' | 'encerradas' | 'todas';

export function campanhasDaLoja(D: DadosExemplo, lojaId: string, aba: Aba) {
  return D.campanhas.filter((k) => k.lojaId === lojaId).filter((k) =>
    aba === 'todas' ? true : aba === 'ativas' ? k.status === 'ativa' : aba === 'futuras' ? k.status === 'agendada' || k.status === 'rascunho'
      : k.status === 'encerrada' || k.status === 'cancelada').map((x) => resumoCampanha(D, x));
}

export function beneficiosDaLoja(D: DadosExemplo, lojaId: string) {
  return D.beneficios.filter((b) => b.lojaId === lojaId).map((b) => ({
    beneficio: b, emUso: D.campanhas.filter((k) => k.beneficioIds.includes(b.id)).map((k) => k.nome),
  }));
}

export function campanhaDaLoja(D: DadosExemplo, lojaId: string, id: string) {
  const k = D.campanhas.find((c) => c.id === id && c.lojaId === lojaId);
  if (!k) return undefined;
  const resumo = resumoCampanha(D, k);
  const participantes = D.participacoes.filter((p) => p.campanhaId === k.id).map((p) => {
    const c = D.creators.find((x) => x.id === p.creatorId)!;
    const vendas = D.pedidos.filter((x) => x.campanhaId === k.id && x.creatorId === c.id && pago(x)).reduce((s, x) => s + vendaDoPedido(x), 0);
    return { participacao: p, creator: c, perfil: perfilPrincipal(c), vendas, videos: D.videos.filter((v) => v.campanhaId === k.id && v.creatorId === c.id).length };
  }).sort((a, b) => b.vendas - a.vendas);
  const videos = D.videos.filter((v) => v.campanhaId === k.id).map((v) => ({ video: v, creator: D.creators.find((c) => c.id === v.creatorId) }));
  const convidaveis = D.afiliacoes.filter((a) => a.lojaId === lojaId && a.status === 'aprovado' && !participantes.some((p) => p.creator.id === a.creatorId))
    .map((a) => D.creators.find((c) => c.id === a.creatorId)!);
  return { ...resumo, participantes, videos, convidaveis };
}

export function opcoesDoFormulario(D: DadosExemplo, lojaId: string) {
  return {
    produtos: D.produtos.filter((p) => p.lojaId === lojaId),
    beneficios: D.beneficios.filter((b) => b.lojaId === lojaId),
    loja: D.lojas.find((l) => l.id === lojaId)!,
  };
}

/** Campanhas do creator nas lojas em que está aprovado (R-35: abertas para todos; só convidados para os convidados). */
export function campanhasDoCreator(D: DadosExemplo, creatorId: string) {
  const lojas = D.afiliacoes.filter((a) => a.creatorId === creatorId && (a.status === 'aprovado' || a.status === 'pausado')).map((a) => a.lojaId);
  return D.campanhas.filter((k) => lojas.includes(k.lojaId) && k.status !== 'rascunho' && k.status !== 'cancelada')
    .filter((k) => k.visibilidade === 'aberta' || D.participacoes.some((p) => p.campanhaId === k.id && p.creatorId === creatorId))
    .map((k) => {
      const part = D.participacoes.find((p) => p.campanhaId === k.id && p.creatorId === creatorId);
      const minhasVendas = D.pedidos.filter((p) => p.campanhaId === k.id && p.creatorId === creatorId && pago(p)).reduce((s, p) => s + vendaDoPedido(p), 0);
      return { ...resumoCampanha(D, k), loja: D.lojas.find((l) => l.id === k.lojaId)!, participacao: part, minhasVendas };
    });
}
