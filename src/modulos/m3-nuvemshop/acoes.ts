// Ações de conexão, produtos e cupons (M3). Hoje simulam a Nuvemshop em memória; depois chamam a API.
import type { DadosExemplo } from '../../../dados-exemplo/gerar';

export function mudarCupom(D: DadosExemplo, lojaId: string, cupomId: string, acao: 'pausar' | 'reativar' | 'desativar' | 'tentar') {
  const c = D.cupons.find((x) => x.id === cupomId && x.lojaId === lojaId);
  if (!c) throw new Error('Cupom não encontrado.');
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  if (acao === 'tentar') {
    if (!loja.nuvemshopConectada) throw new Error('Conecte a Nuvemshop antes de criar o cupom na loja.');
    c.status = 'ativo';
    c.nuvemshopId ??= 700000 + Math.floor(Math.random() * 99999);
    return;
  }
  if (c.status === 'erro_sync') throw new Error('Este cupom ainda não existe na Nuvemshop. Use "Tentar de novo".');
  c.status = acao === 'pausar' ? 'pausado' : acao === 'reativar' ? 'ativo' : 'desativado';
}

export function conectarNuvemshop(D: DadosExemplo, lojaId: string): number {
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  loja.nuvemshopConectada = true;
  loja.nuvemshopStoreId ??= 5100000 + Math.floor(Math.random() * 9999);
  // Ao conectar, os cupons que falharam são criados na loja.
  let criados = 0;
  for (const c of D.cupons.filter((x) => x.lojaId === lojaId && x.status === 'erro_sync')) { c.status = 'ativo'; criados += 1; }
  return criados;
}

export function desconectarNuvemshop(D: DadosExemplo, lojaId: string) {
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  loja.nuvemshopConectada = false;
}
