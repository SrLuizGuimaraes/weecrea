// R-01 a R-06: a quem e a qual campanha o pedido pertence. Dono: M4.
import type { Afiliacao, Campanha, Centavos, Creator, Cupom, Participacao, Pedido } from '@/contratos/tipos';
import { diaEmSaoPaulo } from '@/lib/datas';

/** R-05. Subtotal menos desconto, sem frete, nunca negativa. */
export function calcularBaseComissao(p: Pick<Pedido, 'subtotalCentavos' | 'descontoCentavos'>): Centavos {
  return Math.max(0, p.subtotalCentavos - p.descontoCentavos);
}

/** Códigos de cupom do pedido, em maiúsculas. Vários cupons vêm separados por vírgula, na ordem da Nuvemshop. */
export function codigosDoPedido(p: Pick<Pedido, 'cupom'>): string[] {
  return (p.cupom ?? '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
}

/** R-04. Comprador com o mesmo e-mail do creator. */
export function ehAutocompra(emailComprador: string | undefined | null, creator: Pick<Creator, 'email'>): boolean {
  if (!emailComprador) return false;
  return emailComprador.trim().toLowerCase() === creator.email.trim().toLowerCase();
}

export interface ResultadoAtribuicao { creatorId?: string; campanhaId?: string; geraComissao: boolean; motivo?: string }

/** R-06. Campanha do pedido: ativa no pagamento, creator aceito antes, item da campanha. Empate: maior comissão, depois a mais antiga. */
export function campanhaDoPedido(pedido: Pedido, creatorId: string, campanhas: Campanha[], participacoes: Participacao[]): Campanha | undefined {
  if (!pedido.pagoEm) return undefined;
  const pagoEm = Date.parse(pedido.pagoEm);
  const dia = diaEmSaoPaulo(pedido.pagoEm);
  const produtosDoPedido = new Set(pedido.itens.map((i) => i.produtoId).filter(Boolean));
  return campanhas
    .filter((c) => c.lojaId === pedido.lojaId && c.status !== 'rascunho' && c.status !== 'cancelada')
    .filter((c) => c.inicio.slice(0, 10) <= dia && dia <= c.fim.slice(0, 10))
    .filter((c) => participacoes.some((p) => p.campanhaId === c.id && p.creatorId === creatorId && p.status === 'aceito'
      && !!p.aceitaEm && Date.parse(p.aceitaEm) < pagoEm))
    .filter((c) => c.produtoIds.length === 0 || c.produtoIds.some((id) => produtosDoPedido.has(id)))
    .sort((a, b) => b.comissaoBps - a.comissaoBps || a.inicio.localeCompare(b.inicio))[0];
}

/**
 * R-01 a R-06. Diz de qual creator e de qual campanha é o pedido e se ele gera comissão.
 * O pedido fica do creator mesmo quando não gera comissão (o motivo explica): o painel mostra a venda.
 * pedido.autocompra deve vir preenchido com ehAutocompra() pelo M4.
 */
export function atribuirPedido(
  pedido: Pedido, cupons: Cupom[], afiliacoes: Afiliacao[], creators: Creator[],
  campanhas: Campanha[], participacoes: Participacao[],
): ResultadoAtribuicao {
  // R-01 e R-02: primeiro código que for cupom de creator desta loja
  const daLoja = cupons.filter((c) => c.lojaId === pedido.lojaId);
  let cupom: Cupom | undefined;
  for (const codigo of codigosDoPedido(pedido)) {
    cupom = daLoja.find((c) => c.codigo.trim().toUpperCase() === codigo);
    if (cupom) break;
  }
  if (!cupom) return { geraComissao: false, motivo: 'Sem cupom de creator' };

  const creatorId = cupom.creatorId;
  const campanha = campanhaDoPedido(pedido, creatorId, campanhas, participacoes);
  const resultado = (geraComissao: boolean, motivo?: string): ResultadoAtribuicao => ({
    creatorId, ...(campanha ? { campanhaId: campanha.id } : {}), geraComissao, ...(motivo ? { motivo } : {}),
  });

  // Só pedido pago gera comissão
  if (!pedido.pagoEm || (pedido.estado !== 'pago' && pedido.estado !== 'devolvido_parcial')) return resultado(false, 'Pedido não pago');
  // R-03
  const creator = creators.find((c) => c.id === creatorId);
  if (!creator) return resultado(false, 'Creator não encontrado');
  if (creator.bloqueado) return resultado(false, 'Creator bloqueado');
  const afiliacao = afiliacoes.find((a) => a.lojaId === pedido.lojaId && a.creatorId === creatorId);
  if (!afiliacao) return resultado(false, 'Creator sem afiliação na loja');
  if (afiliacao.status !== 'aprovado' && afiliacao.status !== 'pausado') return resultado(false, `Afiliação ${afiliacao.status}`);
  // R-04
  if (pedido.autocompra) return resultado(false, 'Autocompra');
  return resultado(true);
}
