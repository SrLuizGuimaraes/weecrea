import { describe, expect, it } from 'vitest';
import { diaEmSaoPaulo, formatarData, formatarDataHora, somarDias, inicioDoDiaSP, fimDoDiaSP } from './datas';

describe('datas', () => {
  it('converte instante UTC no dia de São Paulo', () => {
    expect(diaEmSaoPaulo('2026-11-25T02:30:00Z')).toBe('2026-11-24'); // 23h30 do dia 24 em SP
    expect(diaEmSaoPaulo('2026-11-25T03:00:00Z')).toBe('2026-11-25');
    expect(diaEmSaoPaulo(new Date('2026-11-25T15:00:00Z'))).toBe('2026-11-25');
  });
  it('soma dias em datas de calendário', () => {
    expect(somarDias('2026-11-28', 7)).toBe('2026-12-05');
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('início e fim do dia de São Paulo em UTC', () => {
    expect(inicioDoDiaSP('2026-11-25').toISOString()).toBe('2026-11-25T03:00:00.000Z');
    expect(fimDoDiaSP('2026-11-25').toISOString()).toBe('2026-11-26T02:59:59.999Z');
  });
  it('formata para a tela', () => {
    expect(formatarData('2026-11-25')).toBe('25/11/2026');
    expect(formatarData('2026-11-25T02:30:00Z')).toBe('24/11/2026');
    expect(formatarDataHora('2026-11-25T15:05:00Z')).toBe('25/11/2026 12:05');
  });
});
