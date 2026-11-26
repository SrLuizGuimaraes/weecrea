// Ações de aprovação (M7). Mudam os dados recebidos (D); hoje em memória, depois no banco.
import type { CriteriosAprovacao } from '@/contratos/tipos';
import type { DadosExemplo } from '../../../dados-exemplo/gerar';
import { avaliarCriterios, decidirAprovacao } from '@/dominio/criterios';
import { gerarCodigoCupom } from '@/dominio/cupom';
import { novoId } from '@/lib/demo/util';

function afiliacao(D: DadosExemplo, lojaId: string, creatorId: string) {
  const a = D.afiliacoes.find((x) => x.lojaId === lojaId && x.creatorId === creatorId);
  if (!a) throw new Error('Creator não encontrado nesta loja.');
  return a;
}

/** Cria o cupom do creator na loja (R-19), se ainda não existir. Devolve o código. */
export function garantirCupom(D: DadosExemplo, lojaId: string, creatorId: string): string {
  const existente = D.cupons.find((c) => c.lojaId === lojaId && c.creatorId === creatorId);
  if (existente) {
    if (existente.status === 'pausado' || existente.status === 'desativado') existente.status = 'ativo';
    return existente.codigo;
  }
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  const creator = D.creators.find((c) => c.id === creatorId)!;
  const codigo = gerarCodigoCupom(creator.nome, loja.cupomDescontoPct, D.cupons.filter((c) => c.lojaId === lojaId).map((c) => c.codigo));
  D.cupons.push({ id: novoId('cp'), lojaId, creatorId, codigo, status: loja.nuvemshopConectada ? 'ativo' : 'erro_sync' });
  return codigo;
}

export function aprovarCreator(D: DadosExemplo, lojaId: string, creatorId: string, decisao: 'manual' | 'automatica' = 'manual'): string {
  const a = afiliacao(D, lojaId, creatorId);
  a.status = 'aprovado'; a.decisao = decisao; a.decididaEm = new Date().toISOString();
  return garantirCupom(D, lojaId, creatorId);
}

export function recusarCreator(D: DadosExemplo, lojaId: string, creatorId: string) {
  const a = afiliacao(D, lojaId, creatorId);
  a.status = 'recusado'; a.decisao = 'manual'; a.decididaEm = new Date().toISOString();
}

function mudarCupom(D: DadosExemplo, lojaId: string, creatorId: string, status: 'ativo' | 'pausado' | 'desativado') {
  const c = D.cupons.find((x) => x.lojaId === lojaId && x.creatorId === creatorId);
  if (c && c.status !== 'erro_sync') c.status = status;
}

export function pausarCreator(D: DadosExemplo, lojaId: string, creatorId: string) {
  afiliacao(D, lojaId, creatorId).status = 'pausado';
  mudarCupom(D, lojaId, creatorId, 'pausado');
}

export function reativarCreator(D: DadosExemplo, lojaId: string, creatorId: string) {
  afiliacao(D, lojaId, creatorId).status = 'aprovado';
  mudarCupom(D, lojaId, creatorId, 'ativo');
}

export function removerCreator(D: DadosExemplo, lojaId: string, creatorId: string) {
  afiliacao(D, lojaId, creatorId).status = 'removido';
  mudarCupom(D, lojaId, creatorId, 'desativado');
}

/** Salva os critérios. Com a automática ligada, reavalia a fila e devolve quantos foram aprovados. */
export function salvarCriterios(D: DadosExemplo, lojaId: string, criterios: CriteriosAprovacao): number {
  const loja = D.lojas.find((l) => l.id === lojaId)!;
  loja.criterios = criterios;
  let aprovados = 0;
  for (const a of D.afiliacoes.filter((x) => x.lojaId === lojaId && x.status === 'pendente')) {
    const creator = D.creators.find((c) => c.id === a.creatorId)!;
    a.falhasCriterios = avaliarCriterios(creator, a, criterios);
    if (decidirAprovacao(a.falhasCriterios, criterios) === 'aprovado') {
      aprovarCreator(D, lojaId, a.creatorId, 'automatica');
      aprovados += 1;
    }
  }
  return aprovados;
}
