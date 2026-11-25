# M7. Aprovação e critérios

**O que é:** Critérios, aprovação automática, fila de análise e cupom na aprovação (R-22, R-23 e R-25).

**Pronto quando:** Quem atende aos critérios é aprovado na hora com cupom na loja; os outros ficam na fila com o motivo.

**Você precisa de:** M3 (Nuvemshop: conexão, produtos e cupons), M6 (Convite e página de cadastro). Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** M9 (Painel de vendas), M10 (Financeiro e comissões).

**Sua junção:** Junção 2 (dom 29/11).

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *M7* de [`docs/GUIA-CLAUDE.md`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] R-22, R-23 e R-25 com testes
- [ ] Tela de critérios e reavaliação da fila
- [ ] Fila de aprovação com o perfil completo
- [ ] Aprovar (cupom e e-mail) e recusar
- [ ] Lista de ativos: pausar e remover

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco M7 do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m7-aprovacao`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).
