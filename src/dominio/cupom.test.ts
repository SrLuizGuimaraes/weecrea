import { describe, expect, it } from 'vitest';
import { gerarCodigoCupom } from './cupom';

describe('R-19 gerarCodigoCupom', () => {
  it('primeiro nome em maiúsculas mais o desconto', () => {
    expect(gerarCodigoCupom('Marina Couto', 10, [])).toBe('MARINA10');
  });
  it('tira acentos e o que não é letra', () => {
    expect(gerarCodigoCupom('Júlia Andrade', 15, [])).toBe('JULIA15');
    expect(gerarCodigoCupom("D'Ávila Souza", 10, [])).toBe('DAVILA10');
    expect(gerarCodigoCupom('  ana-clara  reis', 5, [])).toBe('ANACLARA5');
    expect(gerarCodigoCupom('Çécília', 10, [])).toBe('CECILIA10');
  });
  it('corta o nome em 12 letras', () => {
    expect(gerarCodigoCupom('Maximilianoooo Silva', 10, [])).toBe('MAXIMILIANOO10');
  });
  it('se o código existe, acrescenta 2, 3… antes do desconto', () => {
    expect(gerarCodigoCupom('Marina Alves', 10, ['MARINA10'])).toBe('MARINA210');
    expect(gerarCodigoCupom('Marina Alves', 10, ['MARINA10', 'MARINA210'])).toBe('MARINA310');
  });
  it('compara os existentes sem diferenciar maiúsculas', () => {
    expect(gerarCodigoCupom('Marina', 10, ['marina10'])).toBe('MARINA210');
  });
  it('nome sem letras vira CREATOR', () => {
    expect(gerarCodigoCupom('123', 10, [])).toBe('CREATOR10');
  });
});
