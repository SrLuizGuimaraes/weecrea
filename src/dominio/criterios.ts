// R-22 a R-25: critérios e decisão de aprovação. Dono: M7.
// ASSINATURA criada pelo M1 com valor de exemplo. O M7 troca pelo cálculo real, com testes antes.
import type { Afiliacao, Creator, CriteriosAprovacao } from '@/contratos/tipos';

/** R-22. Cada falha vira um item da lista. */
export function avaliarCriterios(creator: Creator, afiliacao: Afiliacao, criterios: CriteriosAprovacao): string[] {
  void creator; void afiliacao; void criterios;
  return [];
}

/** R-23. Automática ligada e nenhuma falha: aprovado; senão, pendente. Nunca recusa sozinho. */
export function decidirAprovacao(falhas: string[], criterios: CriteriosAprovacao): 'aprovado' | 'pendente' {
  return criterios.aprovacaoAutomatica && falhas.length === 0 ? 'aprovado' : 'pendente';
}
