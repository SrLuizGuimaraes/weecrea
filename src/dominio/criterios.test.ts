import { describe, expect, it } from 'vitest';
import type { Afiliacao, Creator, CriteriosAprovacao } from '@/contratos/tipos';
import { avaliarCriterios, decidirAprovacao, podeCadastrarDeNovo } from './criterios';

const creator = (p: Partial<Creator> = {}): Creator => ({
  id: 'c1', usuarioId: 'u1', nome: 'Ana', email: 'a@ex.com', whatsapp: '', uf: 'SP', cidade: 'SP', bio: '',
  segmentos: ['Moda'], instagram: { perfil: 'ana', seguidores: 12000 }, engajamentoBps: 400, bloqueado: false, ...p,
});
const afiliacao = (p: Partial<Afiliacao> = {}): Afiliacao => ({
  id: 'a1', lojaId: 'l1', creatorId: 'c1', status: 'pendente', origem: 'pagina', temProduto: false, falhasCriterios: [], ...p,
});
const criterios = (p: Partial<CriteriosAprovacao> = {}): CriteriosAprovacao => ({
  aprovacaoAutomatica: true, seguidoresMin: 5000, engajamentoMinBps: 200, redesAceitas: ['instagram', 'tiktok'],
  segmentosAceitos: [], exigeTerProduto: false, ...p,
});

describe('R-22 avaliarCriterios', () => {
  it('sem falhas quando atende a tudo', () => {
    expect(avaliarCriterios(creator(), afiliacao(), criterios())).toEqual([]);
  });
  it('seguidores: vale a rede aceita com mais seguidores', () => {
    const c = creator({ instagram: { perfil: 'a', seguidores: 2000 }, tiktok: { perfil: 'a', seguidores: 9000 } });
    expect(avaliarCriterios(c, afiliacao(), criterios())).toEqual([]);
    expect(avaliarCriterios(c, afiliacao(), criterios({ redesAceitas: ['instagram'] }))[0]).toMatch(/seguidores/i);
  });
  it('cada critério não atendido vira uma falha', () => {
    const c = creator({ instagram: { perfil: 'a', seguidores: 100 }, engajamentoBps: 50, segmentos: ['Pets'] });
    const falhas = avaliarCriterios(c, afiliacao(), criterios({ segmentosAceitos: ['Moda'], exigeTerProduto: true }));
    expect(falhas).toHaveLength(4);
  });
  it('rede não aceita', () => {
    const c = creator({ instagram: undefined, tiktok: { perfil: 'a', seguidores: 90000 } });
    expect(avaliarCriterios(c, afiliacao(), criterios({ redesAceitas: ['instagram'] })).some((f) => /rede/i.test(f))).toBe(true);
  });
  it('segmento vazio na loja aceita todos; ter o produto só conta se exigido', () => {
    expect(avaliarCriterios(creator({ segmentos: ['Pets'] }), afiliacao({ temProduto: false }), criterios())).toEqual([]);
    expect(avaliarCriterios(creator(), afiliacao({ temProduto: true }), criterios({ exigeTerProduto: true }))).toEqual([]);
  });
});

describe('R-23 decidirAprovacao', () => {
  it('automática ligada e sem falhas: aprovado', () => {
    expect(decidirAprovacao([], criterios())).toBe('aprovado');
  });
  it('com falha ou automática desligada: pendente (nunca recusa sozinho)', () => {
    expect(decidirAprovacao(['x'], criterios())).toBe('pendente');
    expect(decidirAprovacao([], criterios({ aprovacaoAutomatica: false }))).toBe('pendente');
  });
});

describe('R-25 podeCadastrarDeNovo', () => {
  it('recusado só depois de 30 dias', () => {
    const a = afiliacao({ status: 'recusado', decididaEm: '2026-11-01T12:00:00Z' });
    expect(podeCadastrarDeNovo(a, '2026-11-30')).toBe(false);
    expect(podeCadastrarDeNovo(a, '2026-12-01')).toBe(true);
  });
  it('quem não foi recusado não precisa esperar', () => {
    expect(podeCadastrarDeNovo(afiliacao({ status: 'removido' }), '2026-11-01')).toBe(true);
  });
});
