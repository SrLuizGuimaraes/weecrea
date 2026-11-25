# M4. Nuvemshop: vendas (pedidos)

**O que é:** Receber da Nuvemshop cada pedido com cupom, marcar pago, cancelado ou devolvido e guardar valor, estado e UF.

**Pronto quando:** Uma compra de teste com cupom vira pedido no sistema e cancelar muda o estado.

**Você precisa de:** M1 (Base e login), M3 (Nuvemshop: conexão, produtos e cupons). Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** M9 (Painel de vendas), M10 (Financeiro e comissões).

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] Receber aviso (webhook) de pedido
- [ ] Guardar pedido com cupom, valor e estado
- [ ] Tratar pago, cancelado e devolvido
- [ ] Guardar o estado (UF) do comprador
- [ ] Teste com compra real de teste

## Regras
- Mexa só nesta pasta (`modulos/m4-nuvemshop-vendas/`). Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m4-nuvemshop-vendas`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).
