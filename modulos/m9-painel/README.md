# M9. Painel de vendas

**O que é:** Painel da loja (período, creator, ranking, produtos, mapa por estado) e tela Início do creator.

**Pronto quando:** Com os pedidos de exemplo, os números batem com uma conferência feita à mão em qualquer período e com qualquer creator.

**Você precisa de:** M4 (Nuvemshop: vendas (pedidos)), M5 (Campanhas e benefícios), M7 (Aprovação e critérios). Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** apresentação.

**Sua junção:** Junção 3 (seg 30/11).

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *M9* de [`docs/GUIA-CLAUDE.md`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] Filtros de período e creator
- [ ] Indicadores (vendas, pedidos, ticket, creators, vídeos, comissões)
- [ ] Gráfico por dia ou semana e barras por creator
- [ ] Ranking de creators e produtos mais vendidos
- [ ] Mapa do Brasil por UF
- [ ] Início do creator (cupom, indicadores, ranking, meta, convites)

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco M9 do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m9-painel`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).
