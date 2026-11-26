// Vendas (M4): pedido de teste, pagamento, cancelamento e devolução, com atribuição (R-01 a R-06) e comissão (R-07 a R-10).
// Hoje simula o aviso da Nuvemshop em memória; depois, o webhook chama estas mesmas regras.
import type { Pedido } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { atribuirPedido, calcularBaseComissao, codigosDoPedido, ehAutocompra } from '@/dominio/atribuicao';
import { aplicarCancelamentoOuDevolucao, calcularComissao, dataDeLiberacao, liberarVencidas, taxaAplicada } from '@/dominio/comissao';
import { statusDaCampanha } from '@/dominio/campanha';
import { novoId } from '@/lib/demo/util';

export interface PedidoTeste {
  cupom: string; itens: { produtoId: string; quantidade: number }[]; freteCentavos: number;
  emailComprador: string; ufComprador: string; pagar: boolean;
}

function campanhasAtualizadas(D: DadosExemplo, quando: string) {
  return D.campanhas.map((k) => ({ ...k, status: statusDaCampanha(k, quando) }));
}

/** Gera a comissão de um pedido pago que pertence a um creator. */
function gerarComissao(D: DadosExemplo, p: Pedido & { emailComprador?: string }) {
  const r = atribuirPedido(p, D.cupons, D.afiliacoes, D.creators, campanhasAtualizadas(D, p.pagoEm!), D.participacoes);
  if (r.creatorId) p.creatorId = r.creatorId; else delete p.creatorId;
  if (r.campanhaId) p.campanhaId = r.campanhaId; else delete p.campanhaId;
  if (!r.geraComissao || !r.creatorId || D.comissoes.some((c) => c.pedidoId === p.id && c.tipo === 'venda')) return r;
  const loja = D.lojas.find((l) => l.id === p.lojaId)!;
  const afiliacao = D.afiliacoes.find((a) => a.lojaId === p.lojaId && a.creatorId === r.creatorId)!;
  const campanha = D.campanhas.find((k) => k.id === r.campanhaId);
  const noAceite = D.participacoes.find((x) => x.campanhaId === r.campanhaId && x.creatorId === r.creatorId)?.comissaoBpsNoAceite;
  const taxa = noAceite ?? taxaAplicada(campanha, afiliacao, loja);
  const base = Math.max(0, p.baseComissaoCentavos - p.devolvidoCentavos);
  D.comissoes.push({
    id: novoId('cm'), lojaId: p.lojaId, creatorId: r.creatorId, pedidoId: p.id, ...(r.campanhaId ? { campanhaId: r.campanhaId } : {}),
    baseCentavos: base, taxaBps: taxa, valorCentavos: calcularComissao(base, taxa), tipo: 'venda', status: 'prevista',
    liberaEm: dataDeLiberacao(p.pagoEm!, loja.retencaoDias), retida: false,
  });
  D.comissoes = liberarVencidas(D.comissoes, new Date().toISOString());
  return r;
}

/** Cria um pedido de teste, como se a Nuvemshop tivesse avisado. Devolve o pedido e o motivo, se não gerou comissão. */
export function criarPedidoTeste(D: DadosExemplo, lojaId: string, t: PedidoTeste) {
  const itens = t.itens.filter((i) => i.quantidade > 0).map((i) => {
    const prod = D.produtos.find((x) => x.id === i.produtoId && x.lojaId === lojaId);
    if (!prod) throw new Error('Produto não encontrado.');
    return { produtoNuvemshopId: prod.nuvemshopId, produtoId: prod.id, nome: prod.nome, quantidade: i.quantidade, precoUnitarioCentavos: prod.precoCentavos };
  });
  if (!itens.length) throw new Error('Escolha ao menos um produto.');
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  const subtotal = itens.reduce((s, i) => s + i.quantidade * i.precoUnitarioCentavos, 0);
  const codigos = codigosDoPedido({ cupom: t.cupom });
  const temCupom = codigos.some((c) => D.cupons.some((x) => x.lojaId === lojaId && x.codigo.toUpperCase() === c && x.status === 'ativo'));
  const desconto = temCupom ? Math.round((subtotal * loja.cupomDescontoPct) / 100) : 0;
  const agora = new Date().toISOString();
  const nuvemshopId = Math.max(0, ...D.pedidos.map((x) => x.nuvemshopId)) + 1;
  const dono = D.cupons.find((x) => x.lojaId === lojaId && codigos.includes(x.codigo.toUpperCase()));
  const creator = dono ? D.creators.find((c) => c.id === dono.creatorId) : undefined;
  const p: DadosExemplo['pedidos'][number] = {
    id: novoId('o'), lojaId, nuvemshopId, numero: String(1000 + D.pedidos.length + 1), ...(t.cupom.trim() ? { cupom: codigos.join(',') } : {}),
    itens, subtotalCentavos: subtotal, descontoCentavos: desconto, freteCentavos: t.freteCentavos,
    totalCentavos: subtotal - desconto + t.freteCentavos, baseComissaoCentavos: calcularBaseComissao({ subtotalCentavos: subtotal, descontoCentavos: desconto }),
    devolvidoCentavos: 0, ufComprador: t.ufComprador, estado: 'aberto', criadoEm: agora,
    autocompra: !!creator && ehAutocompra(t.emailComprador, creator), envioCreator: false, emailComprador: t.emailComprador,
  };
  D.pedidos.push(p);
  if (t.pagar) return { pedidoId: p.id, ...pagarPedido(D, lojaId, p.id) };
  return { pedidoId: p.id, geraComissao: false, motivo: 'Pedido aberto (ainda não pago)' };
}

export function pagarPedido(D: DadosExemplo, lojaId: string, pedidoId: string) {
  const p = D.pedidos.find((x) => x.id === pedidoId && x.lojaId === lojaId);
  if (!p) throw new Error('Pedido não encontrado.');
  if (p.estado !== 'aberto') throw new Error('Só pedido aberto pode ser pago.');
  p.estado = 'pago'; p.pagoEm = new Date().toISOString();
  return gerarComissao(D, p);
}

/** Cancela (ou devolve tudo, ou parte) e aplica a R-10 nas comissões do pedido. */
export function cancelarOuDevolver(D: DadosExemplo, lojaId: string, pedidoId: string, tipo: 'cancelar' | 'devolver' | 'devolver_parte', valorCentavos = 0) {
  const p = D.pedidos.find((x) => x.id === pedidoId && x.lojaId === lojaId);
  if (!p) throw new Error('Pedido não encontrado.');
  if (p.estado === 'cancelado' || p.estado === 'devolvido') throw new Error('Este pedido já foi cancelado ou devolvido.');
  if (tipo === 'devolver_parte') {
    if (p.estado === 'aberto') throw new Error('Pedido aberto não tem devolução: cancele.');
    if (valorCentavos <= 0 || p.devolvidoCentavos + valorCentavos >= p.baseComissaoCentavos) throw new Error('Valor da devolução parcial inválido.');
    p.devolvidoCentavos += valorCentavos; p.estado = 'devolvido_parcial';
  } else if (tipo === 'devolver') {
    if (p.estado === 'aberto') throw new Error('Pedido aberto não tem devolução: cancele.');
    p.devolvidoCentavos = p.baseComissaoCentavos; p.estado = 'devolvido';
  } else {
    p.estado = 'cancelado';
  }
  p.canceladoEm = new Date().toISOString();
  const outras = D.comissoes.filter((c) => c.pedidoId !== p.id);
  const doPedido = D.comissoes.filter((c) => c.pedidoId === p.id);
  const temEstorno = doPedido.some((c) => c.tipo === 'estorno');
  const novas = doPedido.filter((c) => c.tipo === 'venda').flatMap((c) => aplicarCancelamentoOuDevolucao(c, p))
    .filter((c) => !(c.tipo === 'estorno' && temEstorno));
  D.comissoes = [...outras, ...doPedido.filter((c) => c.tipo === 'estorno'), ...novas];
}
