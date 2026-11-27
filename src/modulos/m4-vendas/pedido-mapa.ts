// Tradução do pedido da Nuvemshop para o nosso formato (M4). Função pura, sem banco, com testes.
// ATENÇÃO, suposições a confirmar com um pedido real da loja de teste (a documentação lida não traz o exemplo completo):
//   - "discount" é o desconto total do pedido (cupom + promoções); se vier vazio, usamos "discount_coupon".
//   - "shipping_cost_customer" é o frete pago pelo comprador.
//   - "coupon" é uma lista de objetos com "code".
//   - A UF vem em shipping_address.province (sigla ou nome do estado).
// Reembolso: a API não tem objeto de reembolso; o valor sai de GET /orders/{id}/history/values (total_paid_diff negativo).
import type { Centavos, Pedido } from '@/contratos/tipos';
import { calcularBaseComissao } from '@/dominio/atribuicao';
import { centavosDe } from '@/modulos/m3-nuvemshop/cliente';

export interface PedidoApi {
  id: number; number?: number | string; status?: string; payment_status?: string;
  paid_at?: string | null; cancelled_at?: string | null; created_at: string;
  subtotal?: string | number; discount?: string | number; discount_coupon?: string | number;
  coupon?: { code?: string }[] | null; shipping_cost_customer?: string | number; total?: string | number;
  contact_email?: string | null; shipping_address?: { province?: string | null } | null;
  products?: { product_id?: number; name?: string; quantity?: number; price?: string | number }[];
}

const ESTADOS: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA', ceara: 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES',
  goias: 'GO', maranhao: 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG', para: 'PA', paraiba: 'PB',
  parana: 'PR', pernambuco: 'PE', piaui: 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
  rondonia: 'RO', roraima: 'RR', 'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
};
const SIGLAS = new Set(Object.values(ESTADOS));

export function ufDaProvincia(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (/^[A-Za-z]{2}$/.test(t) && SIGLAS.has(t.toUpperCase())) return t.toUpperCase();
  return ESTADOS[t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()];
}

export type EstadoPedido = Pedido['estado'];

/** Estado do pedido. Cancelado ou anulado vale mais que o pagamento (R-10: estorna do mesmo jeito). */
export function estadoDoPedido(o: Pick<PedidoApi, 'status' | 'payment_status'>): EstadoPedido {
  const pg = (o.payment_status ?? '').toLowerCase();
  if (o.status === 'cancelled' || pg === 'voided') return 'cancelado';
  if (pg === 'refunded') return 'devolvido';
  if (pg === 'partially_refunded') return 'devolvido_parcial';
  if (pg === 'paid' || pg === 'partially_paid') return 'pago';
  return 'aberto';
}

/** Soma dos reembolsos em GET /orders/{id}/history/values (total_paid_diff negativo), em centavos. */
export function reembolsoDoHistorico(historico: unknown): Centavos {
  if (!Array.isArray(historico)) return 0;
  return historico.reduce<number>((soma, h) => {
    const diff = centavosDe((h as { total_paid_diff?: string | number | null })?.total_paid_diff);
    return diff < 0 ? soma + Math.abs(diff) : soma;
  }, 0);
}

export function mapearPedido(o: PedidoApi, reembolsoCentavos: Centavos = 0) {
  const estado = estadoDoPedido(o);
  const subtotalCentavos = centavosDe(o.subtotal);
  const descontoCentavos = centavosDe(o.discount) || centavosDe(o.discount_coupon);
  const baseComissaoCentavos = calcularBaseComissao({ subtotalCentavos, descontoCentavos });
  // Devolvido total devolve toda a base; parcial limita o valor à base.
  const devolvidoCentavos = estado === 'devolvido' ? baseComissaoCentavos : estado === 'devolvido_parcial' ? Math.min(reembolsoCentavos, baseComissaoCentavos) : 0;
  const codigos = (o.coupon ?? []).map((c) => c.code?.trim()).filter((c): c is string => !!c);
  return {
    nuvemshopId: o.id,
    numero: String(o.number ?? o.id),
    cupom: codigos.length ? codigos.join(',') : undefined,
    subtotalCentavos, descontoCentavos,
    freteCentavos: centavosDe(o.shipping_cost_customer),
    totalCentavos: centavosDe(o.total),
    baseComissaoCentavos, devolvidoCentavos,
    ufComprador: ufDaProvincia(o.shipping_address?.province),
    emailComprador: o.contact_email?.trim().toLowerCase() || undefined,
    estado,
    criadoEm: new Date(o.created_at),
    pagoEm: o.paid_at ? new Date(o.paid_at) : undefined,
    canceladoEm: o.cancelled_at ? new Date(o.cancelled_at) : undefined,
    itens: (o.products ?? []).map((p) => ({
      produtoNuvemshopId: p.product_id ?? 0, nome: p.name ?? 'Produto',
      quantidade: p.quantity ?? 1, precoUnitarioCentavos: centavosDe(p.price),
    })),
  };
}
