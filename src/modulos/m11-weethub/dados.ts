// Dados da visão Weethub (M11). Hoje lê os dados de exemplo; depois, o banco.
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { perfilPrincipal } from '@/lib/demo/util';

const pago = (p: { estado: string }) => p.estado === 'pago' || p.estado === 'devolvido_parcial';
const venda = (p: { baseComissaoCentavos: number; devolvidoCentavos: number }) => Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos);

/** Mensalidade de exemplo por loja (a cobrança real vem depois de 02/12). */
export const PLANO = { l1: 49900, l2: 39900, l3: 29900 } as Record<string, number>;

export function resumoEmpresa(D: DadosExemplo, lojaId: string) {
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  const af = D.afiliacoes.filter((a) => a.lojaId === lojaId);
  const pedidos = D.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId && pago(p));
  const dono = D.usuarios.find((u) => u.perfil === 'LOJA' && u.lojaId === lojaId);
  return {
    loja, dono,
    creators: af.filter((a) => a.status === 'aprovado').length,
    pendentes: af.filter((a) => a.status === 'pendente').length,
    campanhas: D.campanhas.filter((k) => k.lojaId === lojaId && k.status === 'ativa').length,
    vendas: pedidos.reduce((s, p) => s + venda(p), 0), pedidos: pedidos.length,
    videos: D.videos.filter((v) => v.lojaId === lojaId).length,
    mensalidade: PLANO[lojaId] ?? 29900,
  };
}

export function empresas(D: DadosExemplo) {
  return D.lojas.map((l) => resumoEmpresa(D, l.id));
}

export function painelWeethub(D: DadosExemplo) {
  const lista = empresas(D);
  const porStatus: Record<string, number> = {};
  for (const e of lista) porStatus[e.loja.status] = (porStatus[e.loja.status] ?? 0) + 1;
  return {
    porStatus, lista,
    vendas: lista.reduce((s, e) => s + e.vendas, 0),
    creators: D.creators.length,
    receitaMensal: lista.filter((e) => e.loja.status === 'ativa' || e.loja.status === 'implantacao').reduce((s, e) => s + e.mensalidade, 0),
  };
}

export function creatorsDaBase(D: DadosExemplo, f: { uf?: string; status?: string; loja?: string; busca?: string }) {
  return D.creators.map((c) => {
    const af = D.afiliacoes.filter((a) => a.creatorId === c.id);
    return {
      creator: c, perfil: perfilPrincipal(c),
      lojas: af.map((a) => ({ loja: D.lojas.find((l) => l.id === a.lojaId)!, status: a.status })),
      vendas: D.pedidos.filter((p) => p.creatorId === c.id && pago(p)).reduce((s, p) => s + venda(p), 0),
    };
  }).filter((r) => (!f.uf || r.creator.uf === f.uf)
    && (!f.loja || r.lojas.some((l) => l.loja.id === f.loja))
    && (!f.status || r.lojas.some((l) => l.status === f.status && (!f.loja || l.loja.id === f.loja)))
    && (!f.busca || r.creator.nome.toLowerCase().includes(f.busca.toLowerCase())))
    .sort((a, b) => b.vendas - a.vendas);
}

export function receita(D: DadosExemplo) {
  const meses = ['2026-09', '2026-10', '2026-11'];
  return empresas(D).map((e) => ({
    ...e,
    porMes: meses.map((m) => ({ mes: m, valor: e.loja.status === 'implantacao' && m !== '2026-11' ? 0 : e.mensalidade })),
  }));
}
