# src/dominio: regras de negócio

Funções puras (sem banco e sem tela). Telas e rotas só chamam estas funções. Cada arquivo tem um dono e um `*.test.ts` ao lado; o dono escreve o teste **antes** do código.

| Arquivo | Dono | Regras | Situação |
| --- | --- | --- | --- |
| `dinheiro.ts` | M1 | centavos e reais | pronto, com testes |
| `cupom.ts` | M3 | R-19 | pronto, com testes (base feita pelo Claude; o M3 revisa e assume) |
| `atribuicao.ts` | M4 | R-01 a R-06 | pronto, com testes (base feita pelo Claude; o M4 revisa e assume). Vários cupons no pedido vêm separados por vírgula em `Pedido.cupom`; `pedido.autocompra` deve vir de `ehAutocompra()` |
| `campanha.ts` | M5 | R-12, R-13, R-35 | assinatura com valor de exemplo |
| `criterios.ts` | M7 | R-22 a R-25 | assinatura com valor de exemplo |
| `comissao.ts` | M10 | R-07 a R-11 | assinatura com valor de exemplo |

Rodar os testes: `npm test`.
