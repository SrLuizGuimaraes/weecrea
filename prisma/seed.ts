// Carrega dados-exemplo/dados.json no banco. Rodar: npm run db:seed
// Pode rodar várias vezes: o que já existe é mantido (skipDuplicates), nada é apagado.
// Senha das pessoas de exemplo: variável SENHA_EXEMPLO. No banco local, sem a variável,
// vale a senha padrão abaixo (só para desenvolvimento; nunca use em produção).
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from '../src/lib/db';
import { gerarHashSenha } from '../src/lib/senha';
import { normalizarCodigoCupom } from '../src/lib/cupom-db';
import type { DadosExemplo } from '../dados-exemplo/gerar';

const SENHA_LOCAL_PADRAO = 'weecrea-exemplo';

const dia = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00Z`);
const data = (d?: string) => (d ? new Date(d) : null);

function senhaDoSeed(): string {
  const url = process.env.DATABASE_URL ?? '';
  if (process.env.SENHA_EXEMPLO) return process.env.SENHA_EXEMPLO;
  if (/@(127\.0\.0\.1|localhost)[:/]/.test(url)) return SENHA_LOCAL_PADRAO;
  throw new Error('Banco remoto: defina SENHA_EXEMPLO para criar as pessoas de exemplo.');
}

async function main() {
  const caminho = fileURLToPath(new URL('../dados-exemplo/dados.json', import.meta.url));
  const d = JSON.parse(readFileSync(caminho, 'utf8')) as DadosExemplo;
  const senhaHash = await gerarHashSenha(senhaDoSeed());

  await db.loja.createMany({
    skipDuplicates: true,
    data: d.lojas.map((l) => ({
      id: l.id, nome: l.nome, slug: l.slug, status: l.status, nuvemshopStoreId: l.nuvemshopStoreId ?? null,
      nuvemshopConectada: l.nuvemshopConectada, comissaoPadraoBps: l.comissaoPadraoBps,
      cupomDescontoPct: l.cupomDescontoPct, retencaoDias: l.retencaoDias,
      aprovacaoAutomatica: l.criterios.aprovacaoAutomatica, seguidoresMin: l.criterios.seguidoresMin,
      engajamentoMinBps: l.criterios.engajamentoMinBps, redesAceitas: l.criterios.redesAceitas,
      segmentosAceitos: l.criterios.segmentosAceitos, exigeTerProduto: l.criterios.exigeTerProduto,
      paginaTitulo: l.paginaCadastro.titulo, paginaTexto: l.paginaCadastro.texto, paginaAberta: l.paginaCadastro.aberta,
    })),
  });
  await db.usuario.createMany({
    skipDuplicates: true,
    data: d.usuarios.map((u) => ({ id: u.id, email: u.email, nome: u.nome, perfil: u.perfil, lojaId: u.lojaId ?? null, senhaHash })),
  });
  await db.creator.createMany({
    skipDuplicates: true,
    data: d.creators.map((c) => ({
      id: c.id, usuarioId: c.usuarioId, nome: c.nome, email: c.email, whatsapp: c.whatsapp, uf: c.uf, cidade: c.cidade,
      bio: c.bio, segmentos: c.segmentos, instagramPerfil: c.instagram?.perfil ?? null,
      instagramSeguidores: c.instagram?.seguidores ?? null, tiktokPerfil: c.tiktok?.perfil ?? null,
      tiktokSeguidores: c.tiktok?.seguidores ?? null, engajamentoBps: c.engajamentoBps ?? null, bloqueado: c.bloqueado,
    })),
  });
  await db.afiliacao.createMany({
    skipDuplicates: true,
    data: d.afiliacoes.map((a) => ({
      id: a.id, lojaId: a.lojaId, creatorId: a.creatorId, status: a.status, origem: a.origem,
      campanhaConviteId: a.campanhaConviteId ?? null, temProduto: a.temProduto, falhasCriterios: a.falhasCriterios,
      decisao: a.decisao ?? null, decididaEm: data(a.decididaEm), comissaoPropriaBps: a.comissaoPropriaBps ?? null,
    })),
  });
  await db.cupom.createMany({
    skipDuplicates: true,
    data: d.cupons.map((c) => ({
      id: c.id, lojaId: c.lojaId, creatorId: c.creatorId, codigo: c.codigo, codigoNormalizado: normalizarCodigoCupom(c.codigo),
      nuvemshopId: c.nuvemshopId ?? null, status: c.status,
    })),
  });
  await db.produto.createMany({
    skipDuplicates: true,
    data: d.produtos.map((p) => ({
      id: p.id, lojaId: p.lojaId, nuvemshopId: p.nuvemshopId, nome: p.nome, categoria: p.categoria ?? null,
      precoCentavos: p.precoCentavos, imagemUrl: p.imagemUrl ?? null,
    })),
  });
  await db.beneficio.createMany({
    skipDuplicates: true,
    data: d.beneficios.map((b) => ({
      id: b.id, lojaId: b.lojaId, nome: b.nome, tipo: b.tipo, recompensa: b.recompensa,
      multiplicadorX100: b.multiplicadorX100 ?? null, bonusBps: b.bonusBps ?? null, topN: b.topN ?? null,
      premioDescricao: b.premioDescricao ?? null,
      periodoInicio: b.periodoInicio ? dia(b.periodoInicio) : null, periodoFim: b.periodoFim ? dia(b.periodoFim) : null,
    })),
  });
  await db.campanha.createMany({
    skipDuplicates: true,
    data: d.campanhas.map((k) => ({
      id: k.id, lojaId: k.lojaId, nome: k.nome, produtoIds: k.produtoIds, inicio: dia(k.inicio), fim: dia(k.fim),
      metaCentavos: k.metaCentavos, metaIndividualCentavos: k.metaIndividualCentavos ?? null, comissaoBps: k.comissaoBps,
      visibilidade: k.visibilidade, entrega: k.entrega, briefing: k.briefing, tags: k.tags, beneficioIds: k.beneficioIds,
      status: k.status,
    })),
  });
  await db.participacao.createMany({
    skipDuplicates: true,
    data: d.participacoes.map((p) => ({
      campanhaId: p.campanhaId, creatorId: p.creatorId, status: p.status, aceitaEm: data(p.aceitaEm),
      comissaoBpsNoAceite: p.comissaoBpsNoAceite ?? null,
    })),
  });
  await db.pedido.createMany({
    skipDuplicates: true,
    data: d.pedidos.map((p) => ({
      id: p.id, lojaId: p.lojaId, nuvemshopId: p.nuvemshopId, numero: p.numero, cupom: p.cupom ?? null,
      creatorId: p.creatorId ?? null, campanhaId: p.campanhaId ?? null, subtotalCentavos: p.subtotalCentavos,
      descontoCentavos: p.descontoCentavos, freteCentavos: p.freteCentavos, totalCentavos: p.totalCentavos,
      baseComissaoCentavos: p.baseComissaoCentavos, devolvidoCentavos: p.devolvidoCentavos,
      ufComprador: p.ufComprador ?? null, emailComprador: p.emailComprador ?? null, estado: p.estado,
      criadoEm: new Date(p.criadoEm), pagoEm: data(p.pagoEm), canceladoEm: data(p.canceladoEm),
      autocompra: p.autocompra, envioCreator: p.envioCreator,
    })),
  });
  const pedidosSemItens = await db.pedido.findMany({ where: { itens: { none: {} } }, select: { id: true } });
  const semItens = new Set(pedidosSemItens.map((p) => p.id));
  await db.itemPedido.createMany({
    data: d.pedidos.filter((p) => semItens.has(p.id)).flatMap((p) => p.itens.map((i) => ({
      pedidoId: p.id, produtoNuvemshopId: i.produtoNuvemshopId, produtoId: i.produtoId ?? null, nome: i.nome,
      quantidade: i.quantidade, precoUnitarioCentavos: i.precoUnitarioCentavos,
    }))),
  });
  await db.pagamento.createMany({
    skipDuplicates: true,
    data: d.pagamentos.map((p) => ({
      id: p.id, lojaId: p.lojaId, creatorId: p.creatorId, valorCentavos: p.valorCentavos, pagoEm: new Date(p.pagoEm),
      forma: p.forma, comprovanteUrl: p.comprovanteUrl ?? null, registradoPor: p.registradoPor,
    })),
  });
  await db.comissao.createMany({
    skipDuplicates: true,
    data: d.comissoes.map((c) => ({
      id: c.id, lojaId: c.lojaId, creatorId: c.creatorId, pedidoId: c.pedidoId, campanhaId: c.campanhaId ?? null,
      baseCentavos: c.baseCentavos, taxaBps: c.taxaBps, valorCentavos: c.valorCentavos, tipo: c.tipo, status: c.status,
      liberaEm: new Date(c.liberaEm), retida: c.retida, pagamentoId: c.pagamentoId ?? null,
    })),
  });
  await db.video.createMany({
    skipDuplicates: true,
    data: d.videos.map((v) => ({
      id: v.id, lojaId: v.lojaId, campanhaId: v.campanhaId ?? null, creatorId: v.creatorId ?? null, origem: v.origem,
      rede: v.rede ?? null, formato: v.formato ?? null, link: v.link ?? null, arquivoUrl: v.arquivoUrl ?? null,
      miniaturaUrl: v.miniaturaUrl ?? null, duracaoSeg: v.duracaoSeg ?? null, tamanhoBytes: v.tamanhoBytes ?? null,
      tags: v.tags, status: v.status, motivoReprovacao: v.motivoReprovacao ?? null, views: v.views ?? null,
      curtidas: v.curtidas ?? null, comentarios: v.comentarios ?? null, publicadoEm: data(v.publicadoEm),
      direito: v.direito, direitoAte: data(v.direitoAte), enviadoEm: new Date(v.enviadoEm),
    })),
  });
  await db.colecao.createMany({
    skipDuplicates: true,
    data: d.colecoes.map((c) => ({ id: c.id, lojaId: c.lojaId, nome: c.nome, videoIds: c.videoIds })),
  });

  const contagem = {
    lojas: await db.loja.count(), usuarios: await db.usuario.count(), creators: await db.creator.count(),
    pedidos: await db.pedido.count(), itens: await db.itemPedido.count(), comissoes: await db.comissao.count(),
    videos: await db.video.count(),
  };
  console.log('Seed carregado:', contagem);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => db.$disconnect());
