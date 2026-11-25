// Dinheiro. Dono: M1.
// Regra da casa: dinheiro sempre em CENTAVOS inteiros; percentual em PONTOS-BASE (1% = 100).
// Use estas funções na entrada (texto ou API) e na saída (tela). Nunca faça conta com reais em ponto flutuante.
import type { Bps, Centavos } from '@/contratos/tipos';

/** Confere que o valor é um inteiro finito (centavos válidos). Devolve o próprio valor. */
export function garantirCentavos(valor: number): Centavos {
  if (!Number.isFinite(valor) || !Number.isInteger(valor)) {
    throw new Error(`Valor em centavos inválido: ${valor}. Use inteiros (R$ 12,34 = 1234).`);
  }
  return valor;
}

/** Converte "123.456" (ponto decimal, sem milhar) em centavos, arredondando meio para cima. */
function decimalParaCentavos(texto: string): Centavos {
  const m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(texto);
  if (!m || (m[2] === '' && (m[3] ?? '') === '')) throw new Error(`Valor em reais inválido: "${texto}"`);
  const negativo = m[1] === '-';
  const inteiro = Number(m[2] || '0');
  const fracao = (m[3] ?? '').padEnd(3, '0');
  let centavos = inteiro * 100 + Number(fracao.slice(0, 2));
  if (Number(fracao[2]) >= 5) centavos += 1;
  return negativo ? -centavos : centavos;
}

/**
 * Converte reais em centavos.
 * Aceita número (12.34), texto brasileiro ("R$ 1.234,56", "12,3") e texto com ponto decimal ("389.90", como a Nuvemshop manda).
 */
export function paraCentavos(reais: number | string): Centavos {
  if (typeof reais === 'number') {
    if (!Number.isFinite(reais)) throw new Error(`Valor em reais inválido: ${reais}`);
    const texto = String(reais);
    return /e/i.test(texto) ? Math.round(reais * 100) : decimalParaCentavos(texto);
  }
  let t = reais.replace(/R\$/gi, '').replace(/\s/g, '');
  if (t === '') throw new Error('Valor em reais vazio');
  if (t.includes(',')) {
    if (t.split(',').length > 2) throw new Error(`Valor em reais inválido: "${reais}"`);
    t = t.replace(/\./g, '').replace(',', '.');
  } else {
    const pontos = t.split('.').length - 1;
    // "1.000.000" ou "1.000" (três dígitos depois do ponto) = separador de milhar
    if (pontos > 1 || /^-?\d{1,3}\.\d{3}$/.test(t)) t = t.replace(/\./g, '');
  }
  return decimalParaCentavos(t);
}

/** Centavos em número de reais, só para exibir em gráficos. Não use para contas. */
export function centavosParaReais(centavos: Centavos): number {
  return garantirCentavos(centavos) / 100;
}

const formatoReais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 123456 → "R$ 1.234,56". Negativo (estorno) → "-R$ 10,50". */
export function formatarReais(centavos: Centavos): string {
  garantirCentavos(centavos);
  const texto = formatoReais.format(Math.abs(centavos) / 100);
  return centavos < 0 ? `-${texto}` : texto;
}

/** Soma de centavos, conferindo que cada parcela é inteira. */
export function somarCentavos(valores: readonly Centavos[]): Centavos {
  return valores.reduce<number>((soma, v) => soma + garantirCentavos(v), 0);
}

const formatoPct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** 1000 → "10%", 1250 → "12,5%". */
export function bpsParaTexto(bps: Bps): string {
  return `${formatoPct.format(bps / 100)}%`;
}
