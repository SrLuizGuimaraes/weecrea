// R-12, R-13 e R-35. Dono: M5.
// ASSINATURA criada pelo M1 com valor de exemplo. O M5 troca pelo cálculo real, com testes antes.
import type { Campanha, DataISO, Participacao } from '@/contratos/tipos';

/** R-12. rascunho, agendada, ativa (no dia de início), encerrada (após o fim), cancelada (manual). */
export function statusDaCampanha(c: Campanha, hoje: DataISO): Campanha['status'] {
  void hoje;
  return c.status;
}

/** R-13. Devolve a lista de erros (vazia = pode salvar). */
export function validarEdicaoCampanhaAtiva(antes: Campanha, depois: Campanha): string[] {
  void antes; void depois;
  return [];
}

/** R-35. Aberta aparece para todos os aprovados; só convidados, apenas para os convidados. */
export function campanhaVisivelPara(c: Campanha, creatorId: string, participacoes: Participacao[]): boolean {
  void creatorId; void participacoes;
  return c.visibilidade === 'aberta';
}
