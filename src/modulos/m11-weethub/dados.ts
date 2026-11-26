// Dados da visão Weethub (M11). Hoje lê os dados de exemplo; depois, o banco.
import 'server-only';
import { dados, perfilPrincipal } from '@/lib/dados-exemplo';

const pago = (p: { estado: string }) => p.estado === 'pago' || p.estado === 'devolvido_parcial';
const venda = (p: { baseComissaoCentavos: number; devolvidoCentavos: number }) => Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos);

/** Mensalidade de exemplo por loja (a cobrança real vem depois de 02/12). */
export const PLANO = { l1: 49900, l2: 39900, l3: 29900 } as Record<string, number>;

export function resumoEmpresa(lojaId: string) {
  const loja = dados.lojas.find((l) => l.id === lojaId)!;
  const af = dados.afiliacoes.filter((a) => a.lojaId === lojaId);
  const pedidos = dados.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId && pago(p));
  const dono = dados.usuarios.find((u) => u.perfil === 'LOJA' && u.lojaId === lojaId);
  return {
    loja, dono,
    creators: af.filter((a) => a.status === 'aprovado').length,
    pendentes: af.filter((a) => a.status === 'pendente').length,
    campanhas: dados.campanhas.filter((k) => k.lojaId === lojaId && k.status === 'ativa').length,
    vendas: pedidos.reduce((s, p) => s + venda(p), 0), pedidos: pedidos.length,
    videos: dados.videos.filter((v) => v.lojaId === lojaId).length,
    mensalidade: PLANO[lojaId] ?? 29900,
  };
}

export function empresas() {
  return dados.lojas.map((l) => resumoEmpresa(l.id));
}

export function painelWeethub() {
  const lista = empresas();
  const porStatus: Record<string, number> = {};
  for (const e of lista) porStatus[e.loja.status] = (porStatus[e.loja.status] ?? 0) + 1;
  return {
    porStatus, lista,
    vendas: lista.reduce((s, e) => s + e.vendas, 0),
    creators: dados.creators.length,
    receitaMensal: lista.filter((e) => e.loja.status === 'ativa' || e.loja.status === 'implantacao').reduce((s, e) => s + e.mensalidade, 0),
  };
}

export function creatorsDaBase(f: { uf?: string; status?: string; loja?: string; busca?: string }) {
  return dados.creators.map((c) => {
    const af = dados.afiliacoes.filter((a) => a.creatorId === c.id);
    return {
      creator: c, perfil: perfilPrincipal(c),
      lojas: af.map((a) => ({ loja: dados.lojas.find((l) => l.id === a.lojaId)!, status: a.status })),
      vendas: dados.pedidos.filter((p) => p.creatorId === c.id && pago(p)).reduce((s, p) => s + venda(p), 0),
    };
  }).filter((r) => (!f.uf || r.creator.uf === f.uf)
    && (!f.loja || r.lojas.some((l) => l.loja.id === f.loja))
    && (!f.status || r.lojas.some((l) => l.status === f.status && (!f.loja || l.loja.id === f.loja)))
    && (!f.busca || r.creator.nome.toLowerCase().includes(f.busca.toLowerCase())))
    .sort((a, b) => b.vendas - a.vendas);
}

export function receita() {
  const meses = ['2026-09', '2026-10', '2026-11'];
  return empresas().map((e) => ({
    ...e,
    porMes: meses.map((m) => ({ mes: m, valor: e.loja.status === 'implantacao' && m !== '2026-11' ? 0 : e.mensalidade })),
  }));
}
