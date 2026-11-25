// R-19: código do cupom. Dono: M3.

const LIMITE_NOME = 12;

/** Primeiro nome sem acento, só letras A-Z, até 12, em maiúsculas. */
export function baseDoCodigo(nomeCreator: string): string {
  const primeiro = nomeCreator.trim().split(/\s+/)[0] ?? '';
  const letras = primeiro.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
  return letras.slice(0, LIMITE_NOME) || 'CREATOR';
}

/**
 * R-19. Primeiro nome sem acento, só letras, até 12, em maiúsculas, mais o desconto (MARINA10);
 * se já existir, acrescenta 2, 3… (MARINA210). Compara os existentes sem diferenciar maiúsculas.
 */
export function gerarCodigoCupom(nomeCreator: string, descontoPct: number, codigosExistentes: string[]): string {
  const base = baseDoCodigo(nomeCreator);
  const existentes = new Set(codigosExistentes.map((c) => c.trim().toUpperCase()));
  let codigo = `${base}${descontoPct}`;
  for (let n = 2; existentes.has(codigo); n++) codigo = `${base}${n}${descontoPct}`;
  return codigo;
}
