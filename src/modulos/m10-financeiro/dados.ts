// Dados do financeiro e comissões (M10). Hoje lê os dados de exemplo; depois, o banco.
import type { DadosExemplo } from '../../../dados-exemplo/gerar';

const soma = (l: { valorCentavos: number }[]) => l.reduce((s, c) => s + c.valorCentavos, 0);

function extrato(D: DadosExemplo, comissoes: typeof D.comissoes) {
  return comissoes.map((c) => ({
    comissao: c, pedido: D.pedidos.find((p) => p.id === c.pedidoId)!,
    creator: D.creators.find((x) => x.id === c.creatorId)!,
    loja: D.lojas.find((l) => l.id === c.lojaId)!,
    campanha: D.campanhas.find((k) => k.id === c.campanhaId),
  })).sort((a, b) => (b.pedido.pagoEm ?? '').localeCompare(a.pedido.pagoEm ?? ''));
}

export function financeiroDaLoja(D: DadosExemplo, lojaId: string) {
  const cs = D.comissoes.filter((c) => c.lojaId === lojaId);
  const mes = D.hoje.slice(0, 7);
  const pagamentos = D.pagamentos.filter((p) => p.lojaId === lojaId);
  return {
    aPagar: soma(cs.filter((c) => c.status === 'liberada' && !c.retida)),
    emRetencao: soma(cs.filter((c) => c.status === 'prevista')),
    retidas: cs.filter((c) => c.retida).length,
    pagoNoMes: soma(pagamentos.filter((p) => p.pagoEm.startsWith(mes))),
    estornado: soma(cs.filter((c) => c.status === 'estornada')),
    extrato: extrato(D, cs),
    pagamentos: pagamentos.map((p) => ({ pagamento: p, creator: D.creators.find((c) => c.id === p.creatorId)! })),
  };
}

export function carteiraDaLoja(D: DadosExemplo, lojaId: string) {
  const ids = [...new Set(D.comissoes.filter((c) => c.lojaId === lojaId).map((c) => c.creatorId))];
  return ids.map((creatorId) => {
    const cs = D.comissoes.filter((c) => c.lojaId === lojaId && c.creatorId === creatorId);
    const vendas = D.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId === creatorId && (p.estado === 'pago' || p.estado === 'devolvido_parcial'))
      .reduce((s, p) => s + Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos), 0);
    const liberado = soma(cs.filter((c) => c.status === 'liberada' && !c.retida));
    return {
      creator: D.creators.find((c) => c.id === creatorId)!, vendas,
      previsto: soma(cs.filter((c) => c.status === 'prevista')), liberado,
      pago: soma(cs.filter((c) => c.status === 'paga')), saldo: liberado,
    };
  }).sort((a, b) => b.saldo - a.saldo);
}

/** Faturas da Weethub para a loja (exemplo: a cobrança real fica para depois de 02/12). */
export function faturasDaLoja(D: DadosExemplo, lojaId: string) {
  const base = lojaId === 'l1' ? 49900 : lojaId === 'l2' ? 39900 : 29900;
  return [
    { id: 'f-2026-11', competencia: 'Novembro/2026', valor: base, vencimento: '2026-12-10', status: 'aberta' as const },
    { id: 'f-2026-10', competencia: 'Outubro/2026', valor: base, vencimento: '2026-11-10', status: 'paga' as const },
    { id: 'f-2026-09', competencia: 'Setembro/2026', valor: base, vencimento: '2026-10-10', status: 'paga' as const },
  ];
}

export function financeiroDoCreator(D: DadosExemplo, creatorId: string) {
  const cs = D.comissoes.filter((c) => c.creatorId === creatorId);
  const creator = D.creators.find((c) => c.id === creatorId)!;
  return {
    creator,
    aReceber: soma(cs.filter((c) => c.status === 'liberada' && !c.retida)),
    emRetencao: soma(cs.filter((c) => c.status === 'prevista')),
    proximaLiberacao: cs.filter((c) => c.status === 'prevista').map((c) => c.liberaEm).sort()[0],
    recebido: soma(cs.filter((c) => c.status === 'paga')),
    extrato: extrato(D, cs),
    pagamentos: D.pagamentos.filter((p) => p.creatorId === creatorId).map((p) => ({ pagamento: p, loja: D.lojas.find((l) => l.id === p.lojaId)! })),
  };
}
