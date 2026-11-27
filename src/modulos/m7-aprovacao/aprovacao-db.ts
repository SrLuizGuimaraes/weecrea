// Lógica de aprovação no banco (M7). Não é Server Action: é chamada por outras ações já protegidas
// (as do M7 e o cadastro público do M6). Quem chama é quem confere permissão.
import 'server-only';
import { avaliarCriterios, decidirAprovacao } from '@/dominio/criterios';
import { gerarCodigoCupom } from '@/dominio/cupom';
import { normalizarCodigoCupom } from '@/lib/cupom-db';
import { db } from '@/lib/db';
import { enviarEmail, escaparHtml, moldeEmail } from '@/lib/email';
import { enviarLinkSenha, urlDoApp } from '@/lib/link-senha';
import { mapAfiliacao, mapCreator, mapLoja } from '@/lib/dados-reais';
import { criarCupomNaLoja } from '@/modulos/m3-nuvemshop/cupons-db';

/** Cria o cupom do creator na loja (R-19) se ainda não existir; reativa se estava pausado. Devolve o código. */
export async function garantirCupomNoBanco(lojaId: string, creatorId: string): Promise<string> {
  const existente = await db.cupom.findFirst({ where: { lojaId, creatorId } });
  if (existente) {
    if (existente.status === 'pausado' || existente.status === 'desativado' || existente.status === 'erro_sync') {
      // Reativa lá também; se o cupom ainda não existe na Nuvemshop, tenta criar de novo.
      // Sem id na Nuvemshop (nunca criado, ou apagado ao desativar) o cupom precisa ser criado de novo.
      await db.cupom.update({ where: { id: existente.id }, data: { status: existente.nuvemshopId ? 'ativo' : 'erro_sync' } });
      const loja = await db.loja.findUniqueOrThrow({ where: { id: lojaId } });
      if (loja.nuvemshopConectada) await criarCupomNaLoja(existente.id);
    }
    return (await db.cupom.findUniqueOrThrow({ where: { id: existente.id } })).codigo;
  }
  const [loja, creator, codigos] = await Promise.all([
    db.loja.findUniqueOrThrow({ where: { id: lojaId } }),
    db.creator.findUniqueOrThrow({ where: { id: creatorId } }),
    db.cupom.findMany({ where: { lojaId }, select: { codigo: true } }),
  ]);
  const codigo = gerarCodigoCupom(creator.nome, loja.cupomDescontoPct, codigos.map((c) => c.codigo));
  // Sem a loja conectada o cupom ainda não existe na Nuvemshop: fica em erro_sync até o M3 criar lá.
  const criado = await db.cupom.create({
    data: { lojaId, creatorId, codigo, codigoNormalizado: normalizarCodigoCupom(codigo), status: 'erro_sync', erro: loja.nuvemshopConectada ? null : 'A loja não está conectada à Nuvemshop.' },
  });
  // Com a loja conectada, cria o cupom lá agora (M3). Se o código já existir na Nuvemshop, o M3 troca por um livre.
  // Em falha o cupom fica em erro_sync, com o motivo, para o botão "Tentar de novo" em Produtos e cupons.
  if (loja.nuvemshopConectada) await criarCupomNaLoja(criado.id);
  return (await db.cupom.findUniqueOrThrow({ where: { id: criado.id } })).codigo;
}

/** Aprova a afiliação, garante o cupom e avisa o creator por e-mail. Devolve o código do cupom. */
export async function aprovarAfiliacaoNoBanco(lojaId: string, creatorId: string, decisao: 'manual' | 'automatica'): Promise<string> {
  const af = await db.afiliacao.findUnique({ where: { lojaId_creatorId: { lojaId, creatorId } } });
  if (!af) throw new Error('Creator não encontrado nesta loja.');
  await db.afiliacao.update({ where: { id: af.id }, data: { status: 'aprovado', decisao, decididaEm: new Date(), falhasCriterios: decisao === 'automatica' ? [] : af.falhasCriterios } });
  const cupom = await garantirCupomNoBanco(lojaId, creatorId);
  try { await avisarAprovacao(lojaId, creatorId, cupom); } catch (e) { console.error('[m7] e-mail de aprovação falhou', e); }
  return cupom;
}

async function avisarAprovacao(lojaId: string, creatorId: string, cupom: string) {
  const [loja, creator] = await Promise.all([db.loja.findUniqueOrThrow({ where: { id: lojaId } }), db.creator.findUniqueOrThrow({ where: { id: creatorId }, include: { usuario: true } })]);
  if (!creator.usuario.senhaHash) { await enviarLinkSenha(creator.usuarioId, 'aprovacao_creator', { loja: loja.nome, cupom }); return; }
  const m = moldeEmail({
    titulo: `Você foi aprovada(o) na ${loja.nome}`,
    paragrafos: [`Seu cupom exclusivo é ${escaparHtml(cupom)}. Entre na sua área para ver as campanhas.`],
    botao: { texto: 'Entrar', url: `${urlDoApp()}/entrar` },
  });
  await enviarEmail({ para: creator.email, assunto: `Você foi aprovado na ${loja.nome}`, ...m });
}

export async function avisarRecusa(lojaId: string, creatorId: string) {
  const [loja, creator] = await Promise.all([db.loja.findUniqueOrThrow({ where: { id: lojaId } }), db.creator.findUniqueOrThrow({ where: { id: creatorId } })]);
  const m = moldeEmail({
    titulo: 'Obrigado pelo seu interesse',
    paragrafos: [`A ${escaparHtml(loja.nome)} analisou seu cadastro e, por enquanto, não vai seguir com a parceria. Você pode se cadastrar de novo daqui a 30 dias.`],
  });
  await enviarEmail({ para: creator.email, assunto: `Sobre o seu cadastro na ${loja.nome}`, ...m });
}

/** Reavalia a fila pendente da loja com os critérios atuais; aprova quem atende (R-22, R-23). Devolve quantos. */
export async function reavaliarFila(lojaId: string): Promise<number> {
  const lojaDb = await db.loja.findUniqueOrThrow({ where: { id: lojaId } });
  const criterios = mapLoja(lojaDb).criterios;
  const pendentes = await db.afiliacao.findMany({ where: { lojaId, status: 'pendente' }, include: { creator: true } });
  let aprovados = 0;
  for (const a of pendentes) {
    const falhas = avaliarCriterios(mapCreator(a.creator), mapAfiliacao(a), criterios);
    if (decidirAprovacao(falhas, criterios) === 'aprovado') { await aprovarAfiliacaoNoBanco(lojaId, a.creatorId, 'automatica'); aprovados += 1; }
    else await db.afiliacao.update({ where: { id: a.id }, data: { falhasCriterios: falhas } });
  }
  return aprovados;
}
