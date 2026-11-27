'use server';
// Ações da loja sobre a conexão, os produtos e os cupons (M3).
import { revalidatePath } from 'next/cache';
import { comoAcao, ErroDeRegra, type Resultado } from '@/lib/acao';
import { exigirLoja } from '@/lib/acesso';
import { db } from '@/lib/db';
import { alterarCupomNaLoja, criarCupomNaLoja } from './cupons-db';
import { limparConexao, sincronizarProdutos } from './loja-nuvemshop';

const atualizar = () => { revalidatePath('/loja/conexoes'); revalidatePath('/loja/produtos'); };

export async function desconectarNuvemshopServidor(): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    await limparConexao(lojaId);
    atualizar();
  });
}

export async function sincronizarProdutosServidor(): Promise<Resultado<number>> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    try { const n = await sincronizarProdutos(lojaId); atualizar(); return n; }
    catch (e) { throw new ErroDeRegra(e instanceof Error && /conectada/.test(e.message) ? 'Conecte a Nuvemshop em Conexões para importar produtos.' : 'Não foi possível sincronizar agora. Tente de novo em instantes.'); }
  });
}

export async function mudarCupomServidor(cupomId: string, acao: 'pausar' | 'reativar' | 'desativar' | 'tentar'): Promise<Resultado> {
  return comoAcao(async () => {
    const { lojaId } = await exigirLoja();
    const c = await db.cupom.findFirst({ where: { id: cupomId, lojaId } });
    if (!c) throw new ErroDeRegra('Cupom não encontrado.');
    if (acao === 'tentar') {
      await criarCupomNaLoja(cupomId);
      const depois = await db.cupom.findUniqueOrThrow({ where: { id: cupomId } });
      if (depois.status === 'erro_sync') throw new ErroDeRegra(depois.erro ?? 'Não foi possível criar o cupom na Nuvemshop.');
    } else {
      if (c.status === 'erro_sync') throw new ErroDeRegra('Este cupom ainda não existe na Nuvemshop. Use "Tentar de novo".');
      try { await alterarCupomNaLoja(cupomId, acao === 'pausar' ? 'pausado' : acao === 'reativar' ? 'ativo' : 'desativado'); }
      catch (e) { throw new ErroDeRegra(e instanceof Error ? e.message : 'Não foi possível atualizar o cupom.'); }
    }
    atualizar();
  });
}
