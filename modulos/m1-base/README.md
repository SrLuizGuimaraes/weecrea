# M1. Base e login

**O que é:** Projeto no ar, banco, login com 3 perfis, tipos.ts ampliado, schema.prisma, assinaturas de src/dominio/, upload no Vercel Blob, cron e criptografia do token da Nuvemshop.

**Pronto quando:** As 3 pessoas de exemplo entram e cada uma vê só a sua área; o seed carrega; os testes de dinheiro passam; um arquivo de 300 MB sobe para o Blob.

**Você precisa de:** ninguém, você começa já. Enquanto isso, use os dados de mentira em `dados-exemplo/`.

**Você entrega para:** todos.

**Sua junção:** Junção 1 (sex 27/11).

**Prompt para o Claude Code:** cole o *prompt base* e, logo abaixo, o bloco *M1* de [`docs/GUIA-CLAUDE.md`](../../docs/GUIA-CLAUDE.md). Lá estão as rotas e pastas que são suas, as tarefas em detalhe e as regras de negócio.

## Checklist
Marque as caixinhas na **issue do seu módulo** no GitHub (o painel lê de lá).

- [ ] Projeto Next.js na Vercel com o Neon ligado
- [ ] tipos.ts novo, schema.prisma com as restrições de unicidade e primeira migração
- [ ] dados.json no novo formato e seed
- [ ] Assinaturas de src/dominio/ e dinheiro.ts com testes
- [ ] Login (Auth.js), 3 perfis e middleware de acesso
- [ ] Link para definir senha por e-mail (Resend)
- [ ] Upload direto para o Blob e rota de cron protegida
- [ ] Cifrar e decifrar o token da Nuvemshop
- [ ] CODEOWNERS e aviso ao time

## Regras
- Mexa só nas suas rotas e pastas, listadas no bloco M1 do guia. Precisa mudar algo de outro módulo? Peça na issue dele.
- Trabalhe na sua branch `m1-base`.
- Terminou uma parte? Abra um Pull Request (veja `docs/COMO-INTEGRAR.md`).

## Como os outros usam o que o M1 entregou
- **Quem está logado:** `const { lojaId } = await exigirLoja()` (ou `exigirCreator`, `exigirWeethub`) de `src/lib/acesso.ts`; filtre toda consulta por esse id.
- **Banco:** `import { db } from "@/lib/db"`; tipos em `src/contratos/tipos.ts`; dinheiro com `formatarReais` e `paraCentavos` de `src/dominio/dinheiro.ts`.
- **E-mail com link de senha:** `enviarLinkSenha(usuarioId, "aprovacao_creator", { loja, cupom })` de `src/lib/link-senha.ts`.
- **Upload de vídeo:** `enviarArquivo(arquivo, "videos", setProgresso)` de `src/lib/upload-cliente.ts` e `lerVideo(arquivo)` para a miniatura.
- **Cron e segredos:** `negarSeNaoForCron(req)` de `src/lib/cron.ts`; `cifrar`/`decifrar` de `src/lib/cripto.ts`.
