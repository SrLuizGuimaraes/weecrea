// Apoio ao banco para cupons. Dono: M1. (A regra R-19 do código fica em src/dominio/cupom.ts, M3.)

/** Cópia do código em maiúsculas e sem espaços: é ela que o banco usa para a unicidade por loja. */
export function normalizarCodigoCupom(codigo: string): string {
  return codigo.trim().toUpperCase();
}
