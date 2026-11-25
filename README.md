# WEECREA

Plataforma para a loja gerir creators de UGC (campanhas, cupons, vídeos, comissões, aprovação), ligada à Nuvemshop. Entrega: **02/12/2026**.

- **Painel de acompanhamento:** https://weecrea-painel.vercel.app (atualizar: `bash scripts/publicar-painel.sh`)
- **Como todo mundo se junta:** [`docs/COMO-INTEGRAR.md`](docs/COMO-INTEGRAR.md)
- **Guia para o Claude Code (prompt base + bloco de cada módulo):** [`docs/GUIA-CLAUDE.md`](docs/GUIA-CLAUDE.md)
- **Os 11 módulos:** [`modulos/`](modulos/) (um guia por pasta)
- **Idioma comum entre módulos:** [`contratos/tipos.ts`](contratos/tipos.ts)
- **Dados de mentira:** [`dados-exemplo/dados.json`](dados-exemplo/dados.json)

## Stack
Next.js + Prisma + Postgres (Neon) + Auth.js + Vercel Blob + Resend + Vercel. O M1 cria o projeto. Detalhes em [`docs/GUIA-CLAUDE.md`](docs/GUIA-CLAUDE.md).

## O caminho de uma campanha
1. Loja conecta a Nuvemshop e cria a campanha. 2. Convida creators por link/QR. 3. Cadastro: aprovado na hora se bate os critérios, senão análise. 4. Creator recebe cupom, aceita e envia vídeo. 5. Vendas com o cupom entram no painel. 6. Sistema calcula a comissão e a loja registra o pagamento.
