# WEECREA

Plataforma para a loja gerir creators de UGC (campanhas, cupons, vídeos, comissões, aprovação), ligada à Nuvemshop. Entrega: **02/12/2026**.

- **Painel de acompanhamento:** https://weecrea-painel.vercel.app (atualizar: `bash scripts/publicar-painel.sh`)
- **Como todo mundo se junta:** [`docs/COMO-INTEGRAR.md`](docs/COMO-INTEGRAR.md)
- **Guia para o Claude Code (prompt base + bloco de cada módulo):** [`docs/GUIA-CLAUDE.md`](docs/GUIA-CLAUDE.md)
- **Os 11 módulos:** [`modulos/`](modulos/) (um guia por pasta)
- **Idioma comum entre módulos:** [`src/contratos/tipos.ts`](src/contratos/tipos.ts)
> **Mudança de lugar (25/11):** o antigo `contratos/tipos.ts` foi para `src/contratos/tipos.ts`, já na versão ampliada do guia (afiliação, itens do pedido, centavos, ciclo da comissão, vídeo com status e direitos). Importe com `import type { Pedido } from "@/contratos/tipos"`.

- **Dados de mentira:** [`dados-exemplo/dados.json`](dados-exemplo/dados.json)

## Stack
Next.js + Prisma + Postgres (Neon) + Auth.js + Vercel Blob + Resend + Vercel. O M1 cria o projeto. Detalhes em [`docs/GUIA-CLAUDE.md`](docs/GUIA-CLAUDE.md).

## O caminho de uma campanha
1. Loja conecta a Nuvemshop e cria a campanha. 2. Convida creators por link/QR. 3. Cadastro: aprovado na hora se bate os critérios, senão análise. 4. Creator recebe cupom, aceita e envia vídeo. 5. Vendas com o cupom entram no painel. 6. Sistema calcula a comissão e a loja registra o pagamento.

## Rodar no seu computador
Precisa só do Node 24. O banco local é o PGlite (Postgres que roda dentro do Node), sem instalar nada.

```bash
npm install
cp .env.example .env          # preencha AUTH_SECRET, CRIPTO_CHAVE e CRON_SECRET (os comandos estão no arquivo)
npm run db:local              # deixe este terminal aberto: banco na porta 5433
npm run db:migrar             # em outro terminal: cria as tabelas
npm run db:seed               # carrega dados-exemplo/dados.json
npm run dev                   # http://localhost:3000
```

Pessoas de exemplo (senha local padrão: `weecrea-exemplo`, definida em `prisma/seed.ts`):

| Perfil | E-mail | Vê |
| --- | --- | --- |
| Loja | `loja@exemplo.com` | só o Ateliê Jabuticaba (`/loja`) |
| Creator | `creator@exemplo.com` | só os dados da Marina (`/creator`) |
| Weethub | `weethub@exemplo.com` | todas as lojas (`/weethub`) |

Outras lojas: `casaipe@exemplo.com` e `belaraiz@exemplo.com`. Cada creator dos dados de exemplo também entra com o próprio e-mail.

Testes: `npm test`. Verificação completa antes do PR: `npx tsc --noEmit && npm test && npm run build`.

Mudou o `dados-exemplo/gerar.ts`? Rode `npm run db:dados-exemplo` para regerar o `dados.json`.
