// CONTRATOS: o idioma comum entre os módulos.
// Mudou algo aqui? Abra PR para o M1 e avise no grupo.

export type Perfil = 'LOJA' | 'CREATOR' | 'WEETHUB';
export type Centavos = number; // sempre inteiro: R$ 12,34 = 1234
export type Bps = number;      // pontos-base: 10% = 1000
export type DataISO = string;  // '2026-11-25T14:00:00Z' ou '2026-11-25' para dias
export type Rede = 'instagram' | 'tiktok';

export interface Usuario {
  id: string; email: string; nome: string; perfil: Perfil;
  lojaId?: string; creatorId?: string; // conforme o perfil
}

export interface CriteriosAprovacao {
  aprovacaoAutomatica: boolean; seguidoresMin: number; engajamentoMinBps: Bps;
  redesAceitas: Rede[]; segmentosAceitos: string[]; // vazio = todos
  exigeTerProduto: boolean;
}

export interface Loja {
  id: string; nome: string; slug: string;
  status: 'implantacao' | 'ativa' | 'suspensa' | 'cancelada';
  nuvemshopStoreId?: number; nuvemshopConectada: boolean;
  comissaoPadraoBps: Bps; cupomDescontoPct: number; retencaoDias: number; // padrão 7
  criterios: CriteriosAprovacao;
  paginaCadastro: { titulo: string; texto: string; aberta: boolean };
}

export interface Creator {
  id: string; usuarioId: string; nome: string; email: string; whatsapp: string;
  uf: string; cidade: string; bio: string; segmentos: string[];
  instagram?: { perfil: string; seguidores: number };
  tiktok?: { perfil: string; seguidores: number };
  engajamentoBps?: Bps; bloqueado: boolean;
}

// O status fica aqui, não no creator: um creator pode estar em várias lojas.
export interface Afiliacao {
  id: string; lojaId: string; creatorId: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'pausado' | 'removido';
  origem: 'link' | 'qr_code' | 'email' | 'pagina';
  campanhaConviteId?: string; temProduto: boolean;
  falhasCriterios: string[]; decisao?: 'automatica' | 'manual'; decididaEm?: DataISO;
  comissaoPropriaBps?: Bps;
}

export interface Cupom {
  id: string; lojaId: string; creatorId: string; codigo: string; nuvemshopId?: number;
  status: 'ativo' | 'pausado' | 'desativado' | 'erro_sync';
}

export interface Produto {
  id: string; lojaId: string; nuvemshopId: number; nome: string;
  categoria?: string; precoCentavos: Centavos; imagemUrl?: string;
}

export interface Beneficio {
  id: string; lojaId: string; nome: string;
  tipo: 'meta' | 'ranking' | 'periodo';
  recompensa: 'multiplicador' | 'bonus_bps' | 'premio';
  multiplicadorX100?: number; // 200 = comissão em dobro
  bonusBps?: Bps; topN?: number; premioDescricao?: string;
  periodoInicio?: DataISO; periodoFim?: DataISO;
}

export interface Campanha {
  id: string; lojaId: string; nome: string;
  produtoIds: string[]; // vazio = todos os produtos
  inicio: DataISO; fim: DataISO; // dias, fuso de São Paulo
  metaCentavos: Centavos; metaIndividualCentavos?: Centavos; comissaoBps: Bps;
  visibilidade: 'aberta' | 'so_convidados';
  entrega: 'publicar' | 'entregar_arquivo' | 'publicar_e_entregar';
  briefing: string; tags: string[]; beneficioIds: string[];
  status: 'rascunho' | 'agendada' | 'ativa' | 'encerrada' | 'cancelada';
}

export interface Participacao {
  campanhaId: string; creatorId: string;
  status: 'convidado' | 'aceito' | 'recusado' | 'removido';
  aceitaEm?: DataISO; comissaoBpsNoAceite?: Bps;
}

export interface ItemPedido {
  produtoNuvemshopId: number; produtoId?: string; nome: string;
  quantidade: number; precoUnitarioCentavos: Centavos;
}

// Regra de ouro: só pedido PAGO gera comissão. Cancelado ou devolvido estorna.
export interface Pedido {
  id: string; lojaId: string; nuvemshopId: number; numero: string;
  cupom?: string; creatorId?: string; campanhaId?: string;
  itens: ItemPedido[];
  subtotalCentavos: Centavos; descontoCentavos: Centavos; freteCentavos: Centavos;
  totalCentavos: Centavos; baseComissaoCentavos: Centavos; devolvidoCentavos: Centavos;
  ufComprador?: string;
  estado: 'aberto' | 'pago' | 'cancelado' | 'devolvido' | 'devolvido_parcial';
  criadoEm: DataISO; pagoEm?: DataISO; canceladoEm?: DataISO;
  autocompra: boolean; envioCreator: boolean;
}

export interface Comissao {
  id: string; lojaId: string; creatorId: string; pedidoId: string; campanhaId?: string;
  baseCentavos: Centavos; taxaBps: Bps; valorCentavos: Centavos; // estorno = negativo
  tipo: 'venda' | 'estorno';
  status: 'prevista' | 'liberada' | 'paga' | 'estornada';
  liberaEm: DataISO; retida: boolean; pagamentoId?: string;
}

export interface Pagamento {
  id: string; lojaId: string; creatorId: string; valorCentavos: Centavos;
  pagoEm: DataISO; forma: 'pix' | 'transferencia' | 'outro';
  comprovanteUrl?: string; registradoPor: string; comissaoIds: string[];
}

export interface Video {
  id: string; lojaId: string; campanhaId?: string; creatorId?: string;
  origem: 'creator' | 'upload_loja' | 'link';
  rede?: Rede; formato?: 'reels' | 'story' | 'feed' | 'tiktok';
  link?: string; arquivoUrl?: string; miniaturaUrl?: string;
  duracaoSeg?: number; tamanhoBytes?: number;
  tags: string[]; status: 'em_analise' | 'aprovado' | 'reprovado'; motivoReprovacao?: string;
  views?: number; curtidas?: number; comentarios?: number; publicadoEm?: DataISO;
  direito: 'organico' | 'organico_e_anuncio' | 'sem_direito'; direitoAte?: DataISO;
  enviadoEm: DataISO;
}

export interface Colecao { id: string; lojaId: string; nome: string; videoIds: string[] }

