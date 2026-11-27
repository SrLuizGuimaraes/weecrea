# Ordem de merge dos Pull Requests

Há 8 PRs abertos, em duas cadeias empilhadas (cada PR aponta para a branch do anterior). O M2 (PR 13) já entrou dentro do #12.

| Cadeia | Sequência |
|---|---|
| A (o app) | #12 → #16 → #17 → #18 → #19 |
| B (guia e painel) | #14 → #15 → #20 |

Verificado: nenhum conflito dentro das cadeias nem entre elas; a mistura final fica limpa. Testes passam em #12, #16, #17, #18 e #19 (#14, #15 e #20 só mexem em documentação e painel, sem checagem automática).

## Ordem

| # | PR | O que é |
|---|---|---|
| 1 | #12 | M1: base e login (já inclui o M2) |
| 2 | #16 | Telas com dados de exemplo |
| 3 | #17 | M5, M6 e M7 |
| 4 | #18 | M3 e M4 (Nuvemshop) |
| 5 | #19 | Identidade visual do app |
| 6 | #14 | Guia e documentação |
| 7 | #15 | Painel: status sem esgotar o limite do GitHub |
| 8 | #20 | Identidade visual do painel |

O app vem antes dos docs porque o #14 não tem aplicação Next.js: se entrasse primeiro e a Vercel estiver ligada ao repositório, o deploy falharia.

## Como mesclar cada um

1. Use **"Create a merge commit"**, nunca "Squash" nem "Rebase". Com squash, o PR seguinte volta a mostrar as mudanças do anterior e dá conflito.
2. Marque **"Delete branch"**. O GitHub passa o PR seguinte para a `main` sozinho.
3. Antes de mesclar o próximo, confira se a base dele virou `main`. Se não virou:

```powershell
gh pr edit 16 --base main
```

(troque `16` pelo número do PR da vez)

## Antes do primeiro merge (#12)

- Se a Vercel já estiver ligada ao repositório, esse merge dispara deploy de produção com as migrações do banco.
- Cadastre antes as variáveis: `DATABASE_URL`, `AUTH_SECRET`, `CRIPTO_CHAVE` (e, quando for usar, `APP_URL` e `CRON_SECRET`).
- Passo a passo em `docs/DEPLOY-VERCEL.md` (só chega à `main` com o #17; até lá, leia na branch `m5-m6-m7`).
- A única migração do banco está no #12.

## Depois do último merge

- Publique o painel de novo: `scripts/publicar-painel.sh`.
- Marque as caixinhas das issues (o painel só lê o que está lá).

## O que esta ordem não cobre

Ela garante ausência de conflito de código. O comportamento após o deploy depende das chaves da Nuvemshop e das variáveis da Vercel. A integração Nuvemshop só foi testada com API simulada.
