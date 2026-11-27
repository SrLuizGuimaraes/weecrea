// Cupons do creator na Nuvemshop (M3): criar (com conferência de código repetido), pausar, reativar e desativar.
// Atenção: a documentação lida não descreve como pausar um cupom. Usamos PUT { valid: false/true }, que é o campo
// do objeto cupom; CONFIRMAR NA LOJA DE TESTE antes do piloto. Se a Nuvemshop recusar, o status NÃO muda aqui
// e a pessoa vê o erro (assim o nosso banco nunca diz "pausado" com o cupom ainda valendo na loja).
import 'server-only';
import { gerarCodigoCupom } from '@/dominio/cupom';
import { normalizarCodigoCupom } from '@/lib/cupom-db';
import { db } from '@/lib/db';
import { ErroNuvemshop } from './cliente';
import { clienteDaLoja } from './loja-nuvemshop';

type CupomApi = { id: number; code: string };

const resumoErro = (e: unknown) => (e instanceof ErroNuvemshop ? `A Nuvemshop respondeu ${e.status}.` : e instanceof Error ? e.message : 'Falha inesperada.').slice(0, 300);

async function marcarErro(cupomId: string, erro: string) {
  await db.cupom.update({ where: { id: cupomId }, data: { status: 'erro_sync', erro } });
}

/**
 * Cria o cupom na Nuvemshop. Antes confere se o código já existe lá (cupom de outra origem): se existir,
 * troca o código pela regra R-19 (acrescenta 2, 3...) até achar um livre. Nunca lança: em falha deixa o cupom
 * em erro_sync com o motivo, para o botão "Tentar de novo".
 */
export async function criarCupomNaLoja(cupomId: string): Promise<void> {
  const cupom = await db.cupom.findUniqueOrThrow({ where: { id: cupomId }, include: { loja: true, creator: true } });
  if (cupom.nuvemshopId) {
    // Já existe lá: só garante que está ativo.
    try { await alterarCupomNaLoja(cupomId, 'ativo'); } catch (e) { await marcarErro(cupomId, resumoErro(e)); }
    return;
  }
  if (!cupom.loja.nuvemshopConectada) { await marcarErro(cupomId, 'A loja não está conectada à Nuvemshop.'); return; }
  try {
    const cliente = await clienteDaLoja(cupom.lojaId);
    const locais = (await db.cupom.findMany({ where: { lojaId: cupom.lojaId, id: { not: cupomId } }, select: { codigo: true } })).map((c) => c.codigo);
    let codigo = cupom.codigo;
    const ocupados: string[] = [];
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const achados = await cliente.get<CupomApi[]>('/coupons', { q: codigo }).catch((e) => { if (e instanceof ErroNuvemshop && e.status === 404) return []; throw e; });
      if (!achados.some((c) => c.code.toUpperCase() === codigo.toUpperCase())) break;
      ocupados.push(codigo);
      codigo = gerarCodigoCupom(cupom.creator.nome, cupom.loja.cupomDescontoPct, [...locais, ...ocupados]);
    }
    if (codigo !== cupom.codigo) {
      await db.cupom.update({ where: { id: cupomId }, data: { codigo, codigoNormalizado: normalizarCodigoCupom(codigo) } });
    }
    const criado = await cliente.post<CupomApi>('/coupons', { code: codigo, type: 'percentage', value: String(cupom.loja.cupomDescontoPct) });
    await db.cupom.update({ where: { id: cupomId }, data: { nuvemshopId: criado.id, status: 'ativo', erro: null } });
  } catch (e) {
    await marcarErro(cupomId, resumoErro(e));
  }
}

/** Pausa, reativa ou desativa o cupom do creator na loja. Lança Error com texto legível se a Nuvemshop recusar. */
export async function alterarCupomNaLoja(cupomId: string, status: 'ativo' | 'pausado' | 'desativado'): Promise<void> {
  const cupom = await db.cupom.findUniqueOrThrow({ where: { id: cupomId }, include: { loja: true } });
  if (!cupom.nuvemshopId || !cupom.loja.nuvemshopConectada) {
    throw new Error('Este cupom ainda não existe na Nuvemshop. Use "Tentar de novo".');
  }
  try {
    const cliente = await clienteDaLoja(cupom.lojaId);
    if (status === 'desativado') {
      await cliente.delete(`/coupons/${cupom.nuvemshopId}`).catch((e) => { if (!(e instanceof ErroNuvemshop && e.status === 404)) throw e; });
    } else {
      await cliente.put(`/coupons/${cupom.nuvemshopId}`, { valid: status === 'ativo' });
    }
  } catch (e) {
    throw new Error(`Não foi possível atualizar o cupom na Nuvemshop. ${resumoErro(e)}`);
  }
  // Ao desativar o cupom some da Nuvemshop: esquecemos o id, e uma reativação futura cria um novo.
  await db.cupom.update({ where: { id: cupomId }, data: { status, erro: null, ...(status === 'desativado' ? { nuvemshopId: null } : {}) } });
}

/** Usado pelo M7: pausa, reativa ou desativa o cupom do creator, se ele existir e a loja estiver conectada. */
export async function alterarCupomDoCreator(lojaId: string, creatorId: string, status: 'ativo' | 'pausado' | 'desativado'): Promise<void> {
  const cupom = await db.cupom.findFirst({ where: { lojaId, creatorId } });
  if (!cupom || cupom.status === 'erro_sync' || !cupom.nuvemshopId) return; // ainda não existe lá: nada a mudar
  await alterarCupomNaLoja(cupom.id, status);
}
