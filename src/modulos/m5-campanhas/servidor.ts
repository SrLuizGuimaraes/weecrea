'use server';
// Ações de campanhas e benefícios no banco (M5). Cada uma confere quem está logado e a qual loja o dado pertence.
import { revalidatePath } from 'next/cache';
import type { Beneficio, Campanha } from '@/contratos/tipos';
import { campanhaVisivelPara, statusDaCampanha, validarEdicaoCampanhaAtiva } from '@/dominio/campanha';
import { comoAcao, ErroDeRegra, type Resultado } from '@/lib/acao';
import { exigirCreator, exigirLoja } from '@/lib/acesso';
import { mapCampanha, mapParticipacao } from '@/lib/dados-reais';
import { diaEmSaoPaulo } from '@/lib/datas';
import { db } from '@/lib/db';

export type DadosCampanha = Omit<Campanha, 'id' | 'lojaId' | 'status'> & { publicar: boolean };

const data = (dia: string) => new Date(`${dia.slice(0, 10)}T00:00:00Z`);
const atualizarTelas = () => { revalidatePath('/loja/campanhas'); revalidatePath('/creator/campanhas'); };

/** Cria ou edita. Em campanha ativa aplica a R-13. Devolve o id. */
export async function salvarCampanhaServidor(f: DadosCampanha, id?: string): Promise<Resultado<{ id: string }>> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    if (!f.nome.trim()) throw new ErroDeRegra('Dê um nome para a campanha.');
    if (!f.inicio || !f.fim) throw new ErroDeRegra('Informe o início e o fim.');
    if (f.fim < f.inicio) throw new ErroDeRegra('O fim precisa ser depois do início.');
    if (!Number.isInteger(f.comissaoBps) || f.comissaoBps < 0 || f.comissaoBps > 10000) throw new ErroDeRegra('Comissão entre 0% e 100%.');
    if (!Number.isInteger(f.metaCentavos) || f.metaCentavos < 0) throw new ErroDeRegra('Informe a meta da campanha.');
    // Só aceita produtos e benefícios da própria loja.
    const [prodsOk, benOk] = await Promise.all([
      db.produto.count({ where: { lojaId, id: { in: f.produtoIds } } }),
      db.beneficio.count({ where: { lojaId, id: { in: f.beneficioIds } } }),
    ]);
    if (prodsOk !== f.produtoIds.length || benOk !== f.beneficioIds.length) throw new ErroDeRegra('Produto ou benefício inválido.');

    const { publicar, ...campos } = f;
    const hoje = diaEmSaoPaulo();
    const gravar = {
      nome: campos.nome.trim(), produtoIds: campos.produtoIds, inicio: data(campos.inicio), fim: data(campos.fim),
      metaCentavos: campos.metaCentavos, metaIndividualCentavos: campos.metaIndividualCentavos ?? null,
      comissaoBps: campos.comissaoBps, visibilidade: campos.visibilidade, entrega: campos.entrega,
      briefing: campos.briefing, tags: campos.tags, beneficioIds: campos.beneficioIds,
    };
    if (id) {
      const atual = await db.campanha.findFirst({ where: { id, lojaId } });
      if (!atual) throw new ErroDeRegra('Campanha não encontrada.');
      const antes = mapCampanha(atual);
      const efetivo = { ...antes, status: statusDaCampanha(antes, hoje) };
      const erros = validarEdicaoCampanhaAtiva(efetivo, { ...efetivo, ...campos });
      if (erros.length) throw new ErroDeRegra(erros.join(' '));
      const status = atual.status === 'cancelada' ? 'cancelada'
        : atual.status === 'rascunho' && !publicar ? 'rascunho' : statusDaCampanha({ ...efetivo, ...campos, status: 'agendada' }, hoje);
      await db.campanha.update({ where: { id }, data: { ...gravar, status } });
      atualizarTelas();
      return { id };
    }
    const nova = await db.campanha.create({ data: { ...gravar, lojaId, status: 'rascunho' } });
    const status = publicar ? statusDaCampanha({ ...mapCampanha(nova), status: 'agendada' }, hoje) : 'rascunho';
    if (status !== 'rascunho') await db.campanha.update({ where: { id: nova.id }, data: { status } });
    atualizarTelas();
    return { id: nova.id };
  });
}

export async function cancelarCampanhaServidor(id: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const k = await db.campanha.findFirst({ where: { id, lojaId } });
    if (!k) throw new ErroDeRegra('Campanha não encontrada.');
    if (statusDaCampanha(mapCampanha(k), diaEmSaoPaulo()) === 'encerrada') throw new ErroDeRegra('Campanha encerrada não pode ser cancelada.');
    await db.campanha.update({ where: { id }, data: { status: 'cancelada' } });
    atualizarTelas();
  });
}

export async function criarBeneficioServidor(b: Omit<Beneficio, 'id' | 'lojaId'>): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    if (!b.nome.trim()) throw new ErroDeRegra('Dê um nome para o benefício.');
    if (b.recompensa === 'multiplicador' && !(b.multiplicadorX100 && b.multiplicadorX100 >= 100)) throw new ErroDeRegra('O multiplicador precisa ser 1 ou mais.');
    if (b.recompensa === 'bonus_bps' && !(b.bonusBps && b.bonusBps > 0)) throw new ErroDeRegra('Informe quantos pontos somar.');
    if (b.recompensa === 'premio' && !b.premioDescricao?.trim()) throw new ErroDeRegra('Descreva o prêmio.');
    if (b.tipo === 'ranking' && !(b.topN && b.topN >= 1)) throw new ErroDeRegra('Informe quantos do topo.');
    if (b.tipo === 'periodo' && (!b.periodoInicio || !b.periodoFim || b.periodoFim < b.periodoInicio)) throw new ErroDeRegra('Informe um período válido.');
    await db.beneficio.create({
      data: {
        lojaId, nome: b.nome.trim(), tipo: b.tipo, recompensa: b.recompensa,
        multiplicadorX100: b.multiplicadorX100 ?? null, bonusBps: b.bonusBps ?? null, topN: b.topN ?? null,
        premioDescricao: b.premioDescricao?.trim() ?? null,
        periodoInicio: b.periodoInicio ? data(b.periodoInicio) : null, periodoFim: b.periodoFim ? data(b.periodoFim) : null,
      },
    });
    atualizarTelas();
  });
}

export async function excluirBeneficioServidor(id: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const usos = await db.campanha.findMany({ where: { lojaId, beneficioIds: { has: id } }, select: { nome: true } });
    if (usos.length) throw new ErroDeRegra(`Benefício em uso em: ${usos.map((k) => k.nome).join(', ')}.`);
    await db.beneficio.deleteMany({ where: { id, lojaId } });
    atualizarTelas();
  });
}

/** Convida creators já aprovados na loja. Devolve quantos foram convidados. */
export async function convidarCreatorsServidor(campanhaId: string, creatorIds: string[]): Promise<Resultado<number>> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const k = await db.campanha.findFirst({ where: { id: campanhaId, lojaId } });
    if (!k) throw new ErroDeRegra('Campanha não encontrada.');
    const aprovados = await db.afiliacao.findMany({ where: { lojaId, status: 'aprovado', creatorId: { in: creatorIds } }, select: { creatorId: true } });
    let n = 0;
    for (const { creatorId } of aprovados) {
      const p = await db.participacao.findUnique({ where: { campanhaId_creatorId: { campanhaId, creatorId } } });
      if (p && p.status !== 'removido' && p.status !== 'recusado') continue;
      await db.participacao.upsert({
        where: { campanhaId_creatorId: { campanhaId, creatorId } },
        create: { campanhaId, creatorId, status: 'convidado' }, update: { status: 'convidado' },
      });
      n += 1;
    }
    atualizarTelas();
    return n;
  });
}

/** O creator aceita: guarda a comissão do momento do aceite. */
export async function aceitarCampanhaServidor(campanhaId: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { creatorId } = await exigirCreator();
    const k = await db.campanha.findUnique({ where: { id: campanhaId } });
    if (!k) throw new ErroDeRegra('Campanha não encontrada.');
    const camp = mapCampanha(k);
    const af = await db.afiliacao.findUnique({ where: { lojaId_creatorId: { lojaId: k.lojaId, creatorId } } });
    if (af?.status !== 'aprovado') throw new ErroDeRegra('Você precisa estar aprovado na loja.');
    if (statusDaCampanha(camp, diaEmSaoPaulo()) !== 'ativa') throw new ErroDeRegra('Só dá para aceitar campanha ativa.');
    const parts = await db.participacao.findMany({ where: { campanhaId } });
    if (!campanhaVisivelPara(camp, creatorId, parts.map(mapParticipacao))) throw new ErroDeRegra('Esta campanha é só para convidados.');
    await db.participacao.upsert({
      where: { campanhaId_creatorId: { campanhaId, creatorId } },
      create: { campanhaId, creatorId, status: 'aceito', aceitaEm: new Date(), comissaoBpsNoAceite: k.comissaoBps },
      update: { status: 'aceito', aceitaEm: new Date(), comissaoBpsNoAceite: k.comissaoBps },
    });
    atualizarTelas();
  });
}

export async function recusarConviteServidor(campanhaId: string): Promise<Resultado> {
  return comoAcao(async () => {
    const { creatorId } = await exigirCreator();
    await db.participacao.updateMany({ where: { campanhaId, creatorId, status: 'convidado' }, data: { status: 'recusado' } });
    atualizarTelas();
  });
}
