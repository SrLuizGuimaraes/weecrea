// Ações do financeiro (M10). Mudam os dados recebidos (D); hoje em memória, depois no banco.
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { liberarVencidas } from '@/dominio/comissao';
import { centavosParaReais } from '@/dominio/dinheiro';
import { novoId } from '@/lib/demo/util';

const pagaveis = (D: DadosExemplo, lojaId: string, creatorId: string) =>
  D.comissoes.filter((c) => c.lojaId === lojaId && c.creatorId === creatorId && c.status === 'liberada' && !c.retida);

export function saldoDoCreator(D: DadosExemplo, lojaId: string, creatorId: string) {
  return pagaveis(D, lojaId, creatorId).reduce((s, c) => s + c.valorCentavos, 0);
}

/** Paga tudo o que está liberado (estornos negativos já descontam). Devolve o valor pago. */
export function pagarCreator(D: DadosExemplo, lojaId: string, creatorId: string, forma: 'pix' | 'transferencia' | 'outro', pagoEm: string, registradoPor: string, comprovanteUrl?: string): number {
  const lista = pagaveis(D, lojaId, creatorId);
  const valor = lista.reduce((s, c) => s + c.valorCentavos, 0);
  if (valor <= 0) throw new Error('Não há saldo liberado para pagar.');
  const id = novoId('pg');
  for (const c of lista) { c.status = 'paga'; c.pagamentoId = id; }
  D.pagamentos.push({ id, lojaId, creatorId, valorCentavos: valor, pagoEm: new Date(`${pagoEm}T12:00:00-03:00`).toISOString(), forma,
    registradoPor, comissaoIds: lista.map((c) => c.id), ...(comprovanteUrl ? { comprovanteUrl } : {}) });
  return valor;
}

export function pagarLote(D: DadosExemplo, lojaId: string, registradoPor: string): { creators: number; valor: number } {
  const ids = [...new Set(D.comissoes.filter((c) => c.lojaId === lojaId).map((c) => c.creatorId))].filter((id) => saldoDoCreator(D, lojaId, id) > 0);
  if (!ids.length) throw new Error('Nenhum creator com saldo liberado.');
  const hoje = new Date().toISOString().slice(0, 10);
  const valor = ids.reduce((s, id) => s + pagarCreator(D, lojaId, id, 'pix', hoje, registradoPor), 0);
  return { creators: ids.length, valor };
}

/** CSV do lote (nome, chave Pix, valor) para o banco. A chave Pix real vem dos dados de pagamento cifrados. */
export function csvDoLote(D: DadosExemplo, lojaId: string): string {
  const ids = [...new Set(D.comissoes.filter((c) => c.lojaId === lojaId).map((c) => c.creatorId))];
  const linhas = ids.map((id) => ({ c: D.creators.find((x) => x.id === id)!, v: saldoDoCreator(D, lojaId, id) })).filter((x) => x.v > 0)
    .map(({ c, v }) => `"${c.nome}";"${D.pagamentoCreator?.[c.id]?.pixMascarado ?? 'sem chave cadastrada'}";${centavosParaReais(v).toFixed(2).replace('.', ',')}`);
  return ['nome;chave_pix;valor', ...linhas].join('\n');
}

/** Cron diário: libera as comissões vencidas e não retidas. Devolve quantas liberou. */
export function liberarComissoes(D: DadosExemplo, agora = new Date().toISOString()): number {
  const antes = D.comissoes.filter((c) => c.status === 'liberada').length;
  D.comissoes = liberarVencidas(D.comissoes, agora);
  return D.comissoes.filter((c) => c.status === 'liberada').length - antes;
}

/** R-11: a loja revisa a comissão retida e solta (ou mantém retida). */
export function revisarRetida(D: DadosExemplo, lojaId: string, comissaoId: string, soltar: boolean) {
  const c = D.comissoes.find((x) => x.id === comissaoId && x.lojaId === lojaId);
  if (!c) throw new Error('Comissão não encontrada.');
  c.retida = !soltar;
  if (soltar) D.comissoes = liberarVencidas(D.comissoes, new Date().toISOString());
}

/** Dados de pagamento do creator: na demonstração guardamos só os 4 últimos dígitos (no banco, cifrados). */
export function salvarDadosPagamento(D: DadosExemplo, creatorId: string, cpf: string, tipoPix: string, pix: string) {
  const digitos = cpf.replace(/\D/g, '');
  if (digitos.length !== 11) throw new Error('CPF precisa ter 11 dígitos.');
  if (!pix.trim()) throw new Error('Informe a chave Pix.');
  D.pagamentoCreator = { ...(D.pagamentoCreator ?? {}), [creatorId]: { cpfMascarado: `•••.•••.•${digitos.slice(-4, -2)}-${digitos.slice(-2)}`, tipoPix, pixMascarado: `•••• ${pix.trim().slice(-4)}` } };
}
