import { describe, expect, it } from 'vitest';
import type { Campanha, Participacao } from '@/contratos/tipos';
import { campanhaVisivelPara, statusDaCampanha, validarEdicaoCampanhaAtiva } from './campanha';

const k = (p: Partial<Campanha> = {}): Campanha => ({
  id: 'k1', lojaId: 'l1', nome: 'Verão', produtoIds: [], inicio: '2026-11-01', fim: '2026-11-30', metaCentavos: 100000,
  comissaoBps: 1000, visibilidade: 'aberta', entrega: 'publicar', briefing: '', tags: [], beneficioIds: ['b1'], status: 'agendada', ...p,
});

describe('R-12 statusDaCampanha', () => {
  it('agendada antes do início, ativa no período (inclusive nas pontas), encerrada depois do fim', () => {
    expect(statusDaCampanha(k(), '2026-10-31')).toBe('agendada');
    expect(statusDaCampanha(k(), '2026-11-01')).toBe('ativa');
    expect(statusDaCampanha(k(), '2026-11-30')).toBe('ativa');
    expect(statusDaCampanha(k(), '2026-12-01')).toBe('encerrada');
  });
  it('aceita instante e usa o dia de São Paulo', () => {
    expect(statusDaCampanha(k(), '2026-12-01T02:00:00Z')).toBe('ativa'); // 30/11 23h em SP
  });
  it('rascunho e cancelada não mudam sozinhas', () => {
    expect(statusDaCampanha(k({ status: 'rascunho' }), '2026-11-10')).toBe('rascunho');
    expect(statusDaCampanha(k({ status: 'cancelada' }), '2026-11-10')).toBe('cancelada');
  });
});

describe('R-13 validarEdicaoCampanhaAtiva', () => {
  const antes = k({ status: 'ativa' });
  it('pode aumentar comissão, estender prazo e ganhar benefícios', () => {
    expect(validarEdicaoCampanhaAtiva(antes, { ...antes, comissaoBps: 1500, fim: '2026-12-10', beneficioIds: ['b1', 'b2'] })).toEqual([]);
  });
  it('não pode reduzir comissão, encurtar prazo, mudar o início nem tirar benefício', () => {
    const erros = validarEdicaoCampanhaAtiva(antes, { ...antes, comissaoBps: 900, fim: '2026-11-20', inicio: '2026-11-05', beneficioIds: [] });
    expect(erros).toHaveLength(4);
  });
  it('campanha que não está ativa pode mudar tudo', () => {
    const agendada = k();
    expect(validarEdicaoCampanhaAtiva(agendada, { ...agendada, comissaoBps: 100, fim: '2026-11-02', beneficioIds: [] })).toEqual([]);
  });
});

describe('R-35 campanhaVisivelPara', () => {
  const part = (status: Participacao['status']): Participacao[] => [{ campanhaId: 'k1', creatorId: 'c1', status }];
  it('aberta aparece para todos', () => {
    expect(campanhaVisivelPara(k(), 'c9', [])).toBe(true);
  });
  it('só convidados aparece apenas para convidados e aceitos', () => {
    const c = k({ visibilidade: 'so_convidados' });
    expect(campanhaVisivelPara(c, 'c1', [])).toBe(false);
    expect(campanhaVisivelPara(c, 'c1', part('convidado'))).toBe(true);
    expect(campanhaVisivelPara(c, 'c1', part('aceito'))).toBe(true);
    expect(campanhaVisivelPara(c, 'c1', part('removido'))).toBe(false);
    expect(campanhaVisivelPara(c, 'c2', part('convidado'))).toBe(false);
  });
});
