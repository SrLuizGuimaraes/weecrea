// CONTRATOS: o "idioma comum" entre os módulos.
// Todo módulo lê e grava dados neste formato. Mudou algo aqui? Avise no grupo e abra PR para o M1.

export type Perfil = 'LOJA' | 'CREATOR' | 'WEETHUB';

export interface Loja { id: string; nome: string; slug: string; nuvemshopId?: string }

export interface Creator {
  id: string; nome: string; arroba: string; rede: 'Instagram' | 'TikTok';
  seguidores: number; engajamento: number; segmentos: string[];
  uf?: string; status: 'pendente' | 'ativo' | 'recusado';
}

export interface Campanha {
  id: string; lojaId: string; nome: string; produtoId: string;
  metaVendas: number; comissaoPct: number; inicio: string; fim: string;
  briefing: string; tags: string[]; beneficios: string[];
  status: 'futura' | 'ativa' | 'encerrada';
}

export interface Cupom { codigo: string; creatorId: string; lojaId: string; nuvemshopId?: string }

// Regra de ouro: só PAGO conta comissão. Cancelado/devolvido estorna.
export interface Pedido {
  id: string; lojaId: string; cupom: string; valor: number; uf: string;
  produtoId: string; data: string; estado: 'pago' | 'cancelado' | 'devolvido';
}

export interface Video {
  id: string; creatorId: string; campanhaId: string; rede: 'Instagram' | 'TikTok';
  link?: string; arquivoUrl?: string; views?: number; curtidas?: number; data: string;
}

export interface Comissao { pedidoId: string; creatorId: string; valor: number; estornada: boolean }
export interface Pagamento { id: string; creatorId: string; valor: number; data: string }
