// Ponto de ligação com o M10 (Financeiro e comissões). Dono: M4 até o M10 preencher.
// O M4 chama esta função toda vez que grava um pedido. O M10 troca o corpo por: gerar a comissão quando o pedido
// é pago e gera comissão (R-07 a R-09), ou aplicar o estorno quando fica cancelado/devolvido (R-10).
// Hoje não faz nada de propósito: pedidos são gravados e atribuídos, mas ainda não viram comissão no banco.
import 'server-only';

export interface EventoPedido {
  pedidoId: string; lojaId: string;
  estado: 'aberto' | 'pago' | 'cancelado' | 'devolvido' | 'devolvido_parcial';
  geraComissao: boolean; motivo?: string;
}

export async function aoGravarPedido(evento: EventoPedido): Promise<void> {
  void evento;
}
