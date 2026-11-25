import { describe, expect, it } from 'vitest';
import { perfilPodeAbrir } from './perfis';

describe('perfilPodeAbrir', () => {
  it('cada perfil abre só a sua área', () => {
    expect(perfilPodeAbrir('LOJA', '/loja/painel')).toBe(true);
    expect(perfilPodeAbrir('LOJA', '/creator/inicio')).toBe(false);
    expect(perfilPodeAbrir('LOJA', '/weethub')).toBe(false);
    expect(perfilPodeAbrir('CREATOR', '/creator/financeiro')).toBe(true);
    expect(perfilPodeAbrir('CREATOR', '/loja')).toBe(false);
    expect(perfilPodeAbrir('WEETHUB', '/weethub/empresas')).toBe(true);
    expect(perfilPodeAbrir('WEETHUB', '/loja/painel')).toBe(false);
  });
  it('não confunde prefixos parecidos', () => {
    expect(perfilPodeAbrir('CREATOR', '/lojas-parceiras')).toBe(true);
  });
});
