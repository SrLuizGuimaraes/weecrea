# M4. Nuvemshop: vendas (pedidos)

**O que é:** Webhooks seguros, pedidos com itens, reconciliação e atribuição do pedido ao creator e à campanha (R-01 a R-06).

**Pronto quando:** Uma compra de teste com cupom vira pedido com creator e campanha certos; cancelar muda o estado; o mesmo aviso enviado duas vezes não duplica.

**Você precisa de:** M1 (Base e login), M3 (Nuvemshop: conexão, produtos e cupons). Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** M9 (Painel de vendas), M10 (Financeiro e comissões).

**Sua junção:** Junção 1 (sex 27/11).

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *M4* de [`docs/GUIA-CLAUDE.md`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] R-01 a R-06 com testes antes do código
- [ ] Webhook com assinatura HMAC conferida
- [ ] Gravar pedido completo com itens, sem duplicar
- [ ] Tratar pago, cancelado e devolvido (avisar o M10)
- [ ] Cron de reconciliação a cada 6 horas
- [ ] Importar pedidos dos últimos 90 dias ao conectar
- [ ] Responder aos webhooks de LGPD

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco M4 do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m4-nuvemshop-vendas`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).
