// R-12, R-13 e R-35. Dono: M5.
import type { Campanha, DataISO, Participacao } from '@/contratos/tipos';
import { diaEmSaoPaulo } from '@/lib/datas';

/** R-12. rascunho, agendada, ativa (no dia de início), encerrada (após o fim), cancelada (manual). */
export function statusDaCampanha(c: Campanha, hoje: DataISO): Campanha['status'] {
  if (c.status === 'rascunho' || c.status === 'cancelada') return c.status;
  const dia = hoje.length > 10 ? diaEmSaoPaulo(hoje) : hoje;
  if (dia < c.inicio.slice(0, 10)) return 'agendada';
  if (dia > c.fim.slice(0, 10)) return 'encerrada';
  return 'ativa';
}

/** R-13. Em campanha ativa: pode aumentar comissão e prazo e ganhar benefícios; não pode reduzir, encurtar nem tirar. */
export function validarEdicaoCampanhaAtiva(antes: Campanha, depois: Campanha): string[] {
  if (antes.status !== 'ativa') return [];
  const erros: string[] = [];
  if (depois.comissaoBps < antes.comissaoBps) erros.push('Em campanha ativa a comissão não pode diminuir.');
  if (depois.fim.slice(0, 10) < antes.fim.slice(0, 10)) erros.push('Em campanha ativa o prazo não pode ser encurtado.');
  if (depois.inicio.slice(0, 10) !== antes.inicio.slice(0, 10)) erros.push('Em campanha ativa o início não pode mudar.');
  const tirados = antes.beneficioIds.filter((b) => !depois.beneficioIds.includes(b));
  if (tirados.length) erros.push('Em campanha ativa não é possível tirar benefícios.');
  return erros;
}

/** R-35. Aberta aparece para todos os aprovados; só convidados, apenas para convidados e aceitos. */
export function campanhaVisivelPara(c: Campanha, creatorId: string, participacoes: Participacao[]): boolean {
  if (c.visibilidade === 'aberta') return true;
  return participacoes.some((p) => p.campanhaId === c.id && p.creatorId === creatorId && (p.status === 'convidado' || p.status === 'aceito'));
}
