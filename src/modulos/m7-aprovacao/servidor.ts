'use server';
// Ações de aprovação e critérios no banco (M7). Todas conferem que quem chama é a loja dona da afiliação.
import { revalidatePath } from 'next/cache';
import type { CriteriosAprovacao } from '@/contratos/tipos';
import { comoAcao, ErroDeRegra, type Resultado } from '@/lib/acao';
import { exigirLoja } from '@/lib/acesso';
import { db } from '@/lib/db';
import { aprovarAfiliacaoNoBanco, avisarRecusa, reavaliarFila } from './aprovacao-db';

const atualizar = () => { revalidatePath('/loja/creators'); revalidatePath('/loja/configuracoes'); };

async function afiliacaoDaLoja(lojaId: string, creatorId: string) {
  const a = await db.afiliacao.findUnique({ where: { lojaId_creatorId: { lojaId, creatorId } } });
  if (!a) throw new ErroDeRegra('Creator não encontrado nesta loja.');
  return a;
}

async function mudarCupom(lojaId: string, creatorId: string, status: 'ativo' | 'pausado' | 'desativado') {
  // Cupom em erro_sync ainda não existe na Nuvemshop: não mexe (o M3 trata quando sincronizar).
  await db.cupom.updateMany({ where: { lojaId, creatorId, status: { not: 'erro_sync' } }, data: { status } });
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
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'pausado' } });
    await mudarCupom(lojaId, creatorId, 'pausado');
    atualizar();
  });
}

export async function reativarCreatorServidor(creatorId: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'pausado') throw new ErroDeRegra('Este creator não está pausado.');
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'aprovado' } });
    await mudarCupom(lojaId, creatorId, 'ativo');
    atualizar();
  });
}

export async function removerCreatorServidor(creatorId: string, motivo: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    if (!motivo.trim()) throw new ErroDeRegra('Informe o motivo.');
    const a = await afiliacaoDaLoja(lojaId, creatorId);
    if (a.status !== 'aprovado' && a.status !== 'pausado') throw new ErroDeRegra('Só dá para remover quem está ativo.');
    await db.afiliacao.update({ where: { id: a.id }, data: { status: 'removido', motivoInterno: motivo.trim() } });
    await mudarCupom(lojaId, creatorId, 'desativado');
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
