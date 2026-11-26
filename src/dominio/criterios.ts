// R-22 a R-25: critérios e decisão de aprovação. Dono: M7.
import type { Afiliacao, Creator, CriteriosAprovacao, DataISO } from '@/contratos/tipos';
import { somarDias } from '@/lib/datas';

const num = (n: number) => n.toLocaleString('pt-BR');

/** R-22. Cada critério não atendido vira um item da lista (a primeira é a mostrada na fila). */
export function avaliarCriterios(creator: Creator, afiliacao: Afiliacao, criterios: CriteriosAprovacao): string[] {
  const falhas: string[] = [];
  const redes = criterios.redesAceitas;
  const temRedeAceita = redes.some((r) => (r === 'instagram' ? creator.instagram : creator.tiktok));
  const seguidores = Math.max(0,
    redes.includes('instagram') ? (creator.instagram?.seguidores ?? 0) : 0,
    redes.includes('tiktok') ? (creator.tiktok?.seguidores ?? 0) : 0);
  if (!temRedeAceita) falhas.push(`Nenhuma rede aceita pela loja (${redes.join(', ')})`);
  if (seguidores < criterios.seguidoresMin) falhas.push(`Seguidores abaixo do mínimo de ${num(criterios.seguidoresMin)}`);
  if ((creator.engajamentoBps ?? 0) < criterios.engajamentoMinBps) {
    falhas.push(`Engajamento abaixo do mínimo de ${(criterios.engajamentoMinBps / 100).toLocaleString('pt-BR')}%`);
  }
  if (criterios.segmentosAceitos.length && !creator.segmentos.some((s) => criterios.segmentosAceitos.includes(s))) {
    falhas.push('Segmento fora do perfil da loja');
  }
  if (criterios.exigeTerProduto && !afiliacao.temProduto) falhas.push('Ainda não tem o produto');
  return falhas;
}

/** R-23. Automática ligada e nenhuma falha: aprovado; senão, pendente. O sistema nunca recusa sozinho. */
export function decidirAprovacao(falhas: string[], criterios: CriteriosAprovacao): 'aprovado' | 'pendente' {
  return criterios.aprovacaoAutomatica && falhas.length === 0 ? 'aprovado' : 'pendente';
}

/** R-25. Recusado pode tentar de novo depois de 30 dias. */
export function podeCadastrarDeNovo(afiliacao: Afiliacao, hoje: DataISO): boolean {
  if (afiliacao.status !== 'recusado' || !afiliacao.decididaEm) return true;
  return hoje.slice(0, 10) >= somarDias(afiliacao.decididaEm.slice(0, 10), 30);
}
