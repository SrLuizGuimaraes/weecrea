// Carrega do banco os dados que as telas de M5, M6 e M7 usam, no MESMO formato dos dados de exemplo
// (DadosExemplo), para as telas e as funções de leitura continuarem iguais. Dono: M5 (compartilhado com M6 e M7).
//
// Sempre limitado pela sessão: a loja só recebe os dados da própria loja; o creator só recebe os seus
// e os números agregados das campanhas das lojas em que está afiliado.
// Por enquanto traz só o que M5 a M7 precisam; comissões, pagamentos e coleções vêm vazios (M8, M10).
import 'server-only';
import type { Afiliacao, Beneficio, Campanha, Creator, Loja, Participacao, Pedido, Produto, Video, Cupom } from '@/contratos/tipos';
import { statusDaCampanha } from '@/dominio/campanha';
import { db } from '@/lib/db';
import type { DadosExemplo } from '../../dados-exemplo/gerar';

const dia = (d: Date) => d.toISOString().slice(0, 10);
const iso = (d?: Date | null) => (d ? d.toISOString().replace('.000Z', 'Z') : undefined);
const opc = <T>(v: T | null | undefined) => (v === null ? undefined : v);

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mapLoja = (l: any): Loja => ({
  id: l.id, nome: l.nome, slug: l.slug, status: l.status, nuvemshopStoreId: opc(l.nuvemshopStoreId),
  nuvemshopConectada: l.nuvemshopConectada, comissaoPadraoBps: l.comissaoPadraoBps, cupomDescontoPct: l.cupomDescontoPct,
  retencaoDias: l.retencaoDias,
  criterios: {
    aprovacaoAutomatica: l.aprovacaoAutomatica, seguidoresMin: l.seguidoresMin, engajamentoMinBps: l.engajamentoMinBps,
    redesAceitas: l.redesAceitas, segmentosAceitos: l.segmentosAceitos, exigeTerProduto: l.exigeTerProduto,
  },
  paginaCadastro: { titulo: l.paginaTitulo, texto: l.paginaTexto, aberta: l.paginaAberta },
});

export const mapCreator = (c: any): Creator => ({
  id: c.id, usuarioId: c.usuarioId, nome: c.nome, email: c.email, whatsapp: c.whatsapp, uf: c.uf, cidade: c.cidade,
  bio: c.bio, segmentos: c.segmentos,
  ...(c.instagramPerfil ? { instagram: { perfil: c.instagramPerfil, seguidores: c.instagramSeguidores ?? 0 } } : {}),
  ...(c.tiktokPerfil ? { tiktok: { perfil: c.tiktokPerfil, seguidores: c.tiktokSeguidores ?? 0 } } : {}),
  ...(c.engajamentoBps != null ? { engajamentoBps: c.engajamentoBps } : {}),
  bloqueado: c.bloqueado,
});

export const mapAfiliacao = (a: any): Afiliacao => ({
  id: a.id, lojaId: a.lojaId, creatorId: a.creatorId, status: a.status, origem: a.origem,
  ...(a.campanhaConviteId ? { campanhaConviteId: a.campanhaConviteId } : {}),
  temProduto: a.temProduto, falhasCriterios: a.falhasCriterios,
  ...(a.decisao ? { decisao: a.decisao } : {}), ...(a.decididaEm ? { decididaEm: iso(a.decididaEm) } : {}),
  ...(a.comissaoPropriaBps != null ? { comissaoPropriaBps: a.comissaoPropriaBps } : {}),
});

export const mapCupom = (c: any): Cupom => ({
  id: c.id, lojaId: c.lojaId, creatorId: c.creatorId, codigo: c.codigo,
  ...(c.nuvemshopId != null ? { nuvemshopId: c.nuvemshopId } : {}), status: c.status,
});

export const mapProduto = (p: any): Produto => ({
  id: p.id, lojaId: p.lojaId, nuvemshopId: p.nuvemshopId, nome: p.nome,
  ...(p.categoria ? { categoria: p.categoria } : {}), precoCentavos: p.precoCentavos,
  ...(p.imagemUrl ? { imagemUrl: p.imagemUrl } : {}),
});

export const mapBeneficio = (b: any): Beneficio => ({
  id: b.id, lojaId: b.lojaId, nome: b.nome, tipo: b.tipo, recompensa: b.recompensa,
  ...(b.multiplicadorX100 != null ? { multiplicadorX100: b.multiplicadorX100 } : {}),
  ...(b.bonusBps != null ? { bonusBps: b.bonusBps } : {}), ...(b.topN != null ? { topN: b.topN } : {}),
  ...(b.premioDescricao ? { premioDescricao: b.premioDescricao } : {}),
  ...(b.periodoInicio ? { periodoInicio: dia(b.periodoInicio) } : {}), ...(b.periodoFim ? { periodoFim: dia(b.periodoFim) } : {}),
});

export const mapCampanha = (k: any): Campanha => ({
  id: k.id, lojaId: k.lojaId, nome: k.nome, produtoIds: k.produtoIds, inicio: dia(k.inicio), fim: dia(k.fim),
  metaCentavos: k.metaCentavos, ...(k.metaIndividualCentavos != null ? { metaIndividualCentavos: k.metaIndividualCentavos } : {}),
  comissaoBps: k.comissaoBps, visibilidade: k.visibilidade, entrega: k.entrega, briefing: k.briefing, tags: k.tags,
  beneficioIds: k.beneficioIds, status: k.status,
});

export const mapParticipacao = (p: any): Participacao => ({
  campanhaId: p.campanhaId, creatorId: p.creatorId, status: p.status,
  ...(p.aceitaEm ? { aceitaEm: iso(p.aceitaEm) } : {}),
  ...(p.comissaoBpsNoAceite != null ? { comissaoBpsNoAceite: p.comissaoBpsNoAceite } : {}),
});

const mapPedido = (p: any, anonimo = false): DadosExemplo['pedidos'][number] => ({
  id: p.id, lojaId: p.lojaId, nuvemshopId: p.nuvemshopId, numero: p.numero,
  ...(p.cupom && !anonimo ? { cupom: p.cupom } : {}),
  ...(p.creatorId ? { creatorId: p.creatorId } : {}), ...(p.campanhaId ? { campanhaId: p.campanhaId } : {}),
  itens: anonimo ? [] : (p.itens ?? []).map((i: any) => ({
    produtoNuvemshopId: i.produtoNuvemshopId, ...(i.produtoId ? { produtoId: i.produtoId } : {}), nome: i.nome,
    quantidade: i.quantidade, precoUnitarioCentavos: i.precoUnitarioCentavos,
  })),
  subtotalCentavos: p.subtotalCentavos, descontoCentavos: p.descontoCentavos, freteCentavos: p.freteCentavos,
  totalCentavos: p.totalCentavos, baseComissaoCentavos: p.baseComissaoCentavos, devolvidoCentavos: p.devolvidoCentavos,
  ...(p.ufComprador && !anonimo ? { ufComprador: p.ufComprador } : {}),
  estado: p.estado, criadoEm: iso(p.criadoEm)!, ...(p.pagoEm ? { pagoEm: iso(p.pagoEm) } : {}),
  ...(p.canceladoEm ? { canceladoEm: iso(p.canceladoEm) } : {}), autocompra: p.autocompra, envioCreator: p.envioCreator,
});

const mapVideo = (v: any, ocultarArquivos = false): Video => ({
  id: v.id, lojaId: v.lojaId, ...(v.campanhaId ? { campanhaId: v.campanhaId } : {}),
  ...(v.creatorId ? { creatorId: v.creatorId } : {}), origem: v.origem,
  ...(v.rede ? { rede: v.rede } : {}), ...(v.formato ? { formato: v.formato } : {}),
  ...(v.link && !ocultarArquivos ? { link: v.link } : {}), ...(v.arquivoUrl && !ocultarArquivos ? { arquivoUrl: v.arquivoUrl } : {}),
  ...(v.miniaturaUrl && !ocultarArquivos ? { miniaturaUrl: v.miniaturaUrl } : {}),
  ...(v.duracaoSeg != null ? { duracaoSeg: v.duracaoSeg } : {}), ...(v.tamanhoBytes != null ? { tamanhoBytes: v.tamanhoBytes } : {}),
  tags: v.tags, status: v.status, ...(v.motivoReprovacao ? { motivoReprovacao: v.motivoReprovacao } : {}),
  ...(v.views != null ? { views: v.views } : {}), ...(v.curtidas != null ? { curtidas: v.curtidas } : {}),
  ...(v.comentarios != null ? { comentarios: v.comentarios } : {}), ...(v.publicadoEm ? { publicadoEm: iso(v.publicadoEm) } : {}),
  direito: v.direito, ...(v.direitoAte ? { direitoAte: iso(v.direitoAte) } : {}), enviadoEm: iso(v.enviadoEm)!,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const vazio = (hoje: string): DadosExemplo => ({
  geradoEm: new Date().toISOString(), hoje, usuarios: [], lojas: [], creators: [], afiliacoes: [], cupons: [], produtos: [],
  beneficios: [], campanhas: [], participacoes: [], pedidos: [], comissoes: [], pagamentos: [], videos: [], colecoes: [],
});

/** Tudo da loja (visão da loja). */
export async function carregarDadosLoja(lojaId: string, hoje: string): Promise<DadosExemplo> {
  const [loja, afs, cupons, produtos, beneficios, campanhas, parts, pedidos, videos] = await Promise.all([
    db.loja.findUnique({ where: { id: lojaId } }),
    db.afiliacao.findMany({ where: { lojaId }, include: { creator: true } }),
    db.cupom.findMany({ where: { lojaId } }),
    db.produto.findMany({ where: { lojaId } }),
    db.beneficio.findMany({ where: { lojaId } }),
    db.campanha.findMany({ where: { lojaId } }),
    db.participacao.findMany({ where: { campanha: { lojaId } } }),
    db.pedido.findMany({ where: { lojaId }, include: { itens: true } }),
    db.video.findMany({ where: { lojaId } }),
  ]);
  const D = vazio(hoje);
  if (!loja) return D;
  D.lojas = [mapLoja(loja)];
  D.afiliacoes = afs.map(mapAfiliacao);
  D.creators = afs.map((a) => mapCreator(a.creator));
  D.cupons = cupons.map(mapCupom);
  D.produtos = produtos.map(mapProduto);
  D.beneficios = beneficios.map(mapBeneficio);
  D.campanhas = campanhas.map((k) => { const m = mapCampanha(k); return { ...m, status: statusDaCampanha(m, hoje) }; });
  D.participacoes = parts.map(mapParticipacao);
  D.pedidos = pedidos.map((p) => mapPedido(p));
  D.videos = videos.map((v) => mapVideo(v));
  return D;
}

/** Visão do creator: os seus dados e só números agregados do resto (sem cupom, comprador ou arquivos de outros). */
export async function carregarDadosCreator(creatorId: string, hoje: string): Promise<DadosExemplo> {
  const creator = await db.creator.findUnique({ where: { id: creatorId } });
  const D = vazio(hoje);
  if (!creator) return D;
  const afs = await db.afiliacao.findMany({ where: { creatorId }, include: { loja: true } });
  const lojaIds = afs.map((a) => a.lojaId);
  const [produtos, beneficios, campanhas, cupons] = await Promise.all([
    db.produto.findMany({ where: { lojaId: { in: lojaIds } } }),
    db.beneficio.findMany({ where: { lojaId: { in: lojaIds } } }),
    db.campanha.findMany({ where: { lojaId: { in: lojaIds }, status: { notIn: ['rascunho', 'cancelada'] } } }),
    db.cupom.findMany({ where: { creatorId } }),
  ]);
  const campIds = campanhas.map((k) => k.id);
  const [parts, pedidos, videos] = await Promise.all([
    db.participacao.findMany({ where: { campanhaId: { in: campIds } } }),
    db.pedido.findMany({ where: { campanhaId: { in: campIds } }, include: { itens: true } }),
    db.video.findMany({ where: { campanhaId: { in: campIds } } }),
  ]);
  D.creators = [mapCreator(creator)];
  D.lojas = afs.map((a) => mapLoja(a.loja));
  D.afiliacoes = afs.map(mapAfiliacao);
  D.cupons = cupons.map(mapCupom);
  D.produtos = produtos.map(mapProduto);
  D.beneficios = beneficios.map(mapBeneficio);
  D.campanhas = campanhas.map((k) => { const m = mapCampanha(k); return { ...m, status: statusDaCampanha(m, hoje) }; });
  D.participacoes = parts.map(mapParticipacao);
  D.pedidos = pedidos.map((p) => mapPedido(p, p.creatorId !== creatorId));
  D.videos = videos.map((v) => mapVideo(v, v.creatorId !== creatorId));
  return D;
}
