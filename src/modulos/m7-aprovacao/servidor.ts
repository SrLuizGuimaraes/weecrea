'use server';
// Ações de aprovação e critérios no banco (M7). Todas conferem que quem chama é a loja dona da afiliação.
import { revalidatePath } from 'next/cache';
import type { CriteriosAprovacao } from '@/contratos/tipos';
import { comoAcao, ErroDeRegra, type Resultado } from '@/lib/acao';
import { exigirLoja } from '@/lib/acesso';
import { db } from '@/lib/db';
import { alterarCupomDoCreator } from '@/modulos/m3-nuvemshop/cupons-db';
import { aprovarAfiliacaoNoBanco, avisarRecusa, reavaliarFila } from './aprovacao-db';

const atualizar = () => { revalidatePath('/loja/creators'); revalidatePath('/loja/configuracoes'); };

async function afiliacaoDaLoja(lojaId: string, creatorId: string) {
  const a = await db.afiliacao.findUnique({ where: { lojaId_creatorId: { lojaId, creatorId } } });
  if (!a) throw new ErroDeRegra('Creator não encontrado nesta loja.');
  return a;
}

/** Muda o cupom na Nuvemshop (M3) e no banco. Se a Nuvemshop recusar, lança o erro e a afiliação NÃO muda (quem chama faz isto antes). */
async function mudarCupom(lojaId: string, creatorId: string, status: 'ativo' | 'pausado' | 'desativado') {
  await alterarCupomDoCreator(lojaId, creatorId, status).catch((e) => { throw new ErroDeRegra(e instanceof Error ? e.message : 'Não foi possível atualizar o cupom.'); });
  // Cupom sem id na Nuvemshop (loja sem conexão, por exemplo) só existe no nosso banco: muda só aqui.
  await db.cupom.updateMany({ where: { lojaId, creatorId, nuvemshopId: null, status: { not: 'erro_sync' } }, data: { status } });
}

export async function aprovarCreatorServidor(creatorId: string): Promise<Resultado<{ cupom: string }>> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'pendente' && a.status !== 'recusado') throw new ErroDeRegra('Este cadastro não está na fila.');
    const cupom = await aprovarAfiliacaoNoBanco(lojaId, creatorId, 'manual');
    atualizar();
    return { cupom };
  });
}

export async function recusarCreatorServidor(creatorId: string, motivo?: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'pendente') throw new ErroDeRegra('Só dá para recusar quem está na fila.');
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'recusado', decisao: 'manual', decididaEm: new Date(), motivoInterno: motivo?.trim() || null } });
    try { await avisarRecusa(lojaId, creatorId); } catch (e) { console.error('[m7] e-mail de recusa falhou', e); }
    atualizar();
  });
}

export async function pausarCreatorServidor(creatorId: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'aprovado') throw new ErroDeRegra('Só dá para pausar quem está aprovado.');
    await mudarCupom(lojaId, creatorId, 'pausado');
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'pausado' } });
    atualizar();
  });
}

export async function reativarCreatorServidor(creatorId: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'pausado') throw new ErroDeRegra('Este creator não está pausado.');
    await mudarCupom(lojaId, creatorId, 'ativo');
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'aprovado' } });
    atualizar();
  });
}

export async function removerCreatorServidor(creatorId: string, motivo: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    if (!motivo.trim()) throw new ErroDeRegra('Informe o motivo.');
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'aprovado' && a.status !== 'pausado') throw new ErroDeRegra('Só dá para remover quem está ativo.');
    await mudarCupom(lojaId, creatorId, 'desativado');
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'removido', motivoInterno: motivo.trim() } });
    atualizar();
  });
}

/** Salva os critérios. Com a automática ligada, reavalia a fila e devolve quantos foram aprovados. */
export async function salvarCriteriosServidor(c: CriteriosAprovacao): Promise<Resultado<number>> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    if (!Number.isInteger(c.seguidoresMin) || c.seguidoresMin < 0) throw new ErroDeRegra('Seguidores mínimos inválidos.');
    if (!Number.isInteger(c.engajamentoMinBps) || c.engajamentoMinBps < 0 || c.engajamentoMinBps > 10000) throw new ErroDeRegra('Engajamento mínimo inválido.');
    if (!c.redesAceitas.length) throw new ErroDeRegra('Aceite ao menos uma rede.');
    await db.loja.update({
      where: { id: lojaId },
      data: {
        aprovacaoAutomatica: c.aprovacaoAutomatica, seguidoresMin: c.seguidoresMin, engajamentoMinBps: c.engajamentoMinBps,
        redesAceitas: c.redesAceitas, segmentosAceitos: c.segmentosAceitos, exigeTerProduto: c.exigeTerProduto,
      },
    });
    const aprovados = c.aprovacaoAutomatica ? await reavaliarFila(lojaId) : 0;
    atualizar();
    return aprovados;
  });
}
