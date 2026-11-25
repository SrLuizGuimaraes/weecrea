// R-19: código do cupom. Dono: M3.
// ASSINATURA criada pelo M1 com valor de exemplo. O M3 troca pelo cálculo real, com testes antes.

/**
 * R-19. Primeiro nome sem acento, só letras, até 12, em maiúsculas, mais o desconto (MARINA10);
 * se já existir, acrescenta 2, 3… (MARINA210).
 */
export function gerarCodigoCupom(nomeCreator: string, descontoPct: number, codigosExistentes: string[]): string {
  void nomeCreator; void codigosExistentes;
  return `EXEMPLO${descontoPct}`;
}
