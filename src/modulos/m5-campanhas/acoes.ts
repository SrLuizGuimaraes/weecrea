// Ações de campanhas e benefícios (M5). Mudam os dados recebidos (D); hoje em memória, depois no banco.
import type { Beneficio, Campanha } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { statusDaCampanha, validarEdicaoCampanhaAtiva } from '@/dominio/campanha';
import { diaEmSaoPaulo } from '@/lib/datas';
import { novoId } from '@/lib/demo/util';

export type DadosCampanha = Omit<Campanha, 'id' | 'lojaId' | 'status'> & { publicar: boolean };

/** Cria ou edita. Em campanha ativa aplica a R-13 (lança Error com os motivos). Devolve o id. */
export function salvarCampanha(D: DadosExemplo, lojaId: string, f: DadosCampanha, id?: string): string {
  if (!f.nome.trim()) throw new Error('Dê um nome para a campanha.');
  if (f.fim < f.inicio) throw new Error('O fim precisa ser depois do início.');
  if (f.comissaoBps < 0 || f.comissaoBps > 10000) throw new Error('Comissão entre 0% e 100%.');
  const { publicar, ...campos } = f;
  const hoje = diaEmSaoPaulo();
  if (id) {
    const k = D.campanhas.find((c) => c.id === id && c.lojaId === lojaId);
    if (!k) throw new Error('Campanha não encontrada.');
    const depois: Campanha = { ...k, ...campos };
    const erros = validarEdicaoCampanhaAtiva(k, depois);
    if (erros.length) throw new Error(erros.join(' '));
    const status = k.status === 'rascunho' && !publicar ? 'rascunho' : statusDaCampanha({ ...depois, status: 'agendada' }, hoje);
    Object.assign(k, campos, { status: k.status === 'cancelada' ? 'cancelada' : status });
    return k.id;
  }
  const nova: Campanha = { ...campos, id: novoId('k'), lojaId, status: 'rascunho' };
  nova.status = publicar ? statusDaCampanha({ ...nova, status: 'agendada' }, hoje) : 'rascunho';
  D.campanhas.push(nova);
  return nova.id;
}

export function cancelarCampanha(D: DadosExemplo, lojaId: string, id: string) {
  const k = D.campanhas.find((c) => c.id === id && c.lojaId === lojaId);
  if (!k) throw new Error('Campanha não encontrada.');
  if (k.status === 'encerrada') throw new Error('Campanha encerrada não pode ser cancelada.');
  k.status = 'cancelada';
}

export function criarBeneficio(D: DadosExemplo, lojaId: string, b: Omit<Beneficio, 'id' | 'lojaId'>) {
  if (!b.nome.trim()) throw new Error('Dê um nome para o benefício.');
  D.beneficios.push({ ...b, id: novoId('b'), lojaId });
}

export function excluirBeneficio(D: DadosExemplo, lojaId: string, id: string) {
  const usos = D.campanhas.filter((k) => k.beneficioIds.includes(id)).map((k) => k.nome);
  if (usos.length) throw new Error(`Benefício em uso em: ${usos.join(', ')}.`);
  D.beneficios = D.beneficios.filter((b) => !(b.id === id && b.lojaId === lojaId));
}

export function convidarCreators(D: DadosExemplo, campanhaId: string, creatorIds: string[]): number {
  let n = 0;
  for (const creatorId of creatorIds) {
    const p = D.participacoes.find((x) => x.campanhaId === campanhaId && x.creatorId === creatorId);
    if (p && p.status !== 'removido' && p.status !== 'recusado') continue;
    if (p) p.status = 'convidado'; else D.participacoes.push({ campanhaId, creatorId, status: 'convidado' });
    n += 1;
  }
  return n;
}

/** O creator aceita: guarda a comissão do momento do aceite. */
export function aceitarCampanha(D: DadosExemplo, creatorId: string, campanhaId: string) {
  const k = D.campanhas.find((c) => c.id === campanhaId);
  if (!k || k.status !== 'ativa') throw new Error('Só dá para aceitar campanha ativa.');
  const p = D.participacoes.find((x) => x.campanhaId === campanhaId && x.creatorId === creatorId);
  const dados = { status: 'aceito' as const, aceitaEm: new Date().toISOString(), comissaoBpsNoAceite: k.comissaoBps };
  if (p) Object.assign(p, dados); else D.participacoes.push({ campanhaId, creatorId, ...dados });
}

export function recusarConvite(D: DadosExemplo, creatorId: string, campanhaId: string) {
  const p = D.participacoes.find((x) => x.campanhaId === campanhaId && x.creatorId === creatorId);
  if (p) p.status = 'recusado';
}
