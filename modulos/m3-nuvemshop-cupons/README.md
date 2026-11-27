# M3. Nuvemshop: conexão, produtos e cupons

**O que é:** Conectar a Nuvemshop, registrar webhooks, importar produtos e criar, pausar e desativar cupons (R-19).

**Pronto quando:** A loja piloto conecta, os produtos aparecem e um cupom criado pelo sistema existe na Nuvemshop e pode ser pausado.

**Você precisa de:** M1 (Base e login). Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** M4 (Nuvemshop: vendas (pedidos)), M5 (Campanhas e benefícios), M6 (Convite e página de cadastro), M7 (Aprovação e critérios).

**Sua junção:** Junção 1 (sex 27/11).

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *M3* de [`docs/GUIA-CLAUDE.md`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] Registrar o app e conferir escopos, autenticação e limites
- [ ] Cliente HTTP com limite e novas tentativas
- [ ] Conectar: OAuth e token criptografado
- [ ] Registrar webhooks (pedidos, produtos, desinstalação, LGPD)
- [ ] Importar e atualizar produtos
- [ ] R-19 com testes e ciclo de vida do cupom na loja
- [ ] Telas Conexões e Produtos e cupons

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco M3 do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m3-nuvemshop-cupons`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).
