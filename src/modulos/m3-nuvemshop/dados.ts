// Dados de produtos, cupons e conexão com a Nuvemshop (M3). Hoje lê os dados de exemplo; depois, o banco e a API.
import type { DadosExemplo } from '../../../dados-exemplo/gerar';

export function produtosDaLoja(D: DadosExemplo, lojaId: string) {
  const pedidosPagos = D.pedidos.filter((p) => p.lojaId === lojaId && (p.estado === 'pago' || p.estado === 'devolvido_parcial'));
  return D.produtos.filter((p) => p.lojaId === lojaId).map((p) => ({
    produto: p,
    vendidos: pedidosPagos.flatMap((x) => x.itens).filter((i) => i.produtoId === p.id).reduce((s, i) => s + i.quantidade, 0),
    campanhas: D.campanhas.filter((k) => k.lojaId === lojaId && (k.produtoIds.length === 0 || k.produtoIds.includes(p.id)) && k.status === 'ativa').length,
  }));
}

export function cuponsDaLoja(D: DadosExemplo, lojaId: string) {
  return D.cupons.filter((c) => c.lojaId === lojaId).map((c) => ({
    cupom: c, creator: D.creators.find((x) => x.id === c.creatorId)!,
    usos: D.pedidos.filter((p) => p.lojaId === lojaId && p.creatorId === c.creatorId && p.cupom?.toUpperCase().includes(c.codigo.toUpperCase())).length,
  }));
}

export function conexaoDaLoja(D: DadosExemplo, lojaId: string) {
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  const ultimoPedido = D.pedidos.filter((p) => p.lojaId === lojaId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0];
  return {
    loja,
    produtos: D.produtos.filter((p) => p.lojaId === lojaId).length,
    pedidos: D.pedidos.filter((p) => p.lojaId === lojaId).length,
    ultimoAviso: ultimoPedido?.criadoEm,
    webhooks: ['order/created', 'order/paid', 'order/updated', 'order/cancelled', 'product/created', 'product/updated', 'product/deleted', 'app/uninstalled'],
  };
}
