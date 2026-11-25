import { describe, expect, it } from 'vitest';
import { bpsParaTexto, centavosParaReais, formatarReais, garantirCentavos, paraCentavos, somarCentavos } from './dinheiro';

// Intl usa espaço não separável entre "R$" e o número.
const R = (s: string) => s.replace(' ', '\u00a0');

describe('paraCentavos', () => {
  it('converte número em reais sem erro de ponto flutuante', () => {
    expect(paraCentavos(12.34)).toBe(1234);
    expect(paraCentavos(0.1 + 0.2)).toBe(30);
    expect(paraCentavos(389.9)).toBe(38990);
    expect(paraCentavos(1.005)).toBe(101);
  });
  it('aceita texto no formato brasileiro', () => {
    expect(paraCentavos('R$ 1.234,56')).toBe(123456);
    expect(paraCentavos('12,3')).toBe(1230);
    expect(paraCentavos('0,05')).toBe(5);
    expect(paraCentavos('  R$1.000  ')).toBe(100000);
    expect(paraCentavos('-10,50')).toBe(-1050);
  });
  it('aceita texto com ponto decimal (como a API da Nuvemshop manda)', () => {
    expect(paraCentavos('389.90')).toBe(38990);
    expect(paraCentavos('1234.5')).toBe(123450);
  });
  it('recusa texto inválido', () => {
    expect(() => paraCentavos('abc')).toThrow();
    expect(() => paraCentavos('')).toThrow();
    expect(() => paraCentavos(Number.NaN)).toThrow();
    expect(() => paraCentavos('1,2,3')).toThrow();
  });
});

describe('formatarReais', () => {
  it('formata centavos em reais', () => {
    expect(formatarReais(123456)).toBe(R('R$ 1.234,56'));
    expect(formatarReais(5)).toBe(R('R$ 0,05'));
    expect(formatarReais(0)).toBe(R('R$ 0,00'));
  });
  it('mostra negativo para estorno', () => {
    expect(formatarReais(-1050)).toBe('-' + R('R$ 10,50'));
  });
  it('recusa valor que não é inteiro', () => {
    expect(() => formatarReais(10.5)).toThrow();
  });
});

describe('centavosParaReais', () => {
  it('devolve número em reais', () => {
    expect(centavosParaReais(38990)).toBe(389.9);
  });
});

describe('garantirCentavos', () => {
  it('aceita inteiro e recusa fração ou infinito', () => {
    expect(garantirCentavos(10)).toBe(10);
    expect(() => garantirCentavos(1.5)).toThrow();
    expect(() => garantirCentavos(Infinity)).toThrow();
  });
});

describe('somarCentavos', () => {
  it('soma uma lista de centavos', () => {
    expect(somarCentavos([100, 250, -50])).toBe(300);
    expect(somarCentavos([])).toBe(0);
  });
});

describe('bpsParaTexto', () => {
  it('mostra pontos-base como percentual', () => {
    expect(bpsParaTexto(1000)).toBe('10%');
    expect(bpsParaTexto(1250)).toBe('12,5%');
    expect(bpsParaTexto(5)).toBe('0,05%');
  });
});
