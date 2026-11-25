import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cifrar, decifrar, mascarar } from './cripto';

describe('cripto', () => {
  beforeEach(() => vi.stubEnv('CRIPTO_CHAVE', randomBytes(32).toString('base64')));
  afterEach(() => vi.unstubAllEnvs());

  it('cifra e decifra o mesmo texto', () => {
    const token = 'token-da-nuvemshop-çãé-123';
    const guardado = cifrar(token);
    expect(guardado).not.toContain(token);
    expect(guardado.startsWith('v1:')).toBe(true);
    expect(decifrar(guardado)).toBe(token);
  });

  it('cada cifragem sai diferente', () => {
    expect(cifrar('abc')).not.toBe(cifrar('abc'));
  });

  it('recusa valor adulterado', () => {
    const partes = cifrar('segredo').split(':');
    partes[3] = Buffer.from('outra coisa').toString('base64url');
    expect(() => decifrar(partes.join(':'))).toThrow();
  });

  it('recusa chave errada', () => {
    const guardado = cifrar('segredo');
    vi.stubEnv('CRIPTO_CHAVE', randomBytes(32).toString('base64'));
    expect(() => decifrar(guardado)).toThrow();
  });

  it('exige a chave com 32 bytes', () => {
    vi.stubEnv('CRIPTO_CHAVE', 'curta');
    expect(() => cifrar('x')).toThrow(/32 bytes/);
  });

  it('mascara mostrando só os últimos dígitos', () => {
    expect(mascarar('12345678901')).toBe('•••• 8901');
  });
});
