# src/dominio: regras de negócio

Funções puras (sem banco e sem tela). Telas e rotas só chamam estas funções. Cada arquivo tem um dono e um `*.test.ts` ao lado; o dono escreve o teste **antes** do código.

| Arquivo | Dono | Regras | Situação |
| --- | --- | --- | --- |
| `dinheiro.ts` | M1 | centavos e reais | pronto, com testes |
| `cupom.ts` | M3 | R-19 | pronto, com testes |
| `atribuicao.ts` | M4 | R-01 a R-06 | pronto, com testes. Vários cupons no pedido vêm separados por vírgula em `Pedido.cupom`; `pedido.autocompra` vem de `ehAutocompra()` |
| `campanha.ts` | M5 | R-12, R-13, R-35 | pronto, com testes |
| `criterios.ts` | M7 | R-22 a R-25 | pronto, com testes (R-25: `podeCadastrarDeNovo`) |
| `comissao.ts` | M10 | R-07 a R-11 | pronto, com testes (R-09/R-11: `liberarVencidas`) |

Rodar os testes: `npm test`.

As regras foram escritas pelo Claude como base; cada dono revisa e assume.
