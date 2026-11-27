# M10. Financeiro e comissões

**O que é:** Comissões com retenção e estorno (R-07 a R-11), carteira de creators, pagamentos e extrato.

**Pronto quando:** A comissão aparece no pagamento do pedido, some ao cancelar, libera após a retenção e zera ao marcar como pago.

**Você precisa de:** M4 (Nuvemshop: vendas (pedidos)), M7 (Aprovação e critérios). Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** apresentação.

**Sua junção:** Junção 3 (seg 30/11).

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *M10* de [`docs/GUIA-CLAUDE.md`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] R-07 a R-11 com testes antes do código
- [ ] Gerar comissão no pagamento e aplicar cancelamento e devolução
- [ ] Cron diário de liberação
- [ ] Visão geral da loja e extrato
- [ ] Carteira de creators e pagamentos (individual e em lote)
- [ ] Financeiro do creator (dados de pagamento criptografados)
- [ ] Aba Faturas com dados de exemplo

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco M10 do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m10-financeiro`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).
