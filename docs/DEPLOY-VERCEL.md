# Publicar na Vercel (projeto que já existe)

Quem executa: a pessoa com acesso ao projeto na Vercel. Leva uns 20 minutos. Nada aqui coloca senha no GitHub.

## O que já está pronto no código
- `vercel.json` manda a Vercel rodar `node scripts/vercel-build.mjs`.
- Em **produção** esse script aplica as migrações do banco (`prisma migrate deploy`) e depois faz o build. Em **preview** (PRs) ele só faz o build, sem tocar no banco.
- Build conferido sem nenhuma variável de ambiente (como um preview novo) e com banco: os dois passam.
- `.vercelignore` impede que `.env` e o banco local subam se alguém usar `vercel deploy` pelo terminal.

## Passo 1. Ligar o projeto ao GitHub
No projeto da Vercel: **Settings → Git → Connect Git Repository** → `SrLuizGuimaraes/weecrea`.
Em **Production Branch** deixe `main`. A partir daí, cada merge na `main` publica sozinho e cada Pull Request ganha um endereço de prévia.

Antes de mesclar, a ordem dos PRs é: **#12 (M1) → #16 (telas) → #17 (M5, M6, M7)**. Depois de cada merge, troque a base do PR seguinte para `main`.

## Passo 2. Banco de dados (Neon)
1. Crie um projeto no Neon (ou **Storage → Create → Neon** na própria Vercel, que já preenche `DATABASE_URL`).
2. Use a string de conexão com `sslmode=require`.

## Passo 3. Variáveis de ambiente
**Settings → Environment Variables.** Marque **Production** (e Preview, se quiser testar PRs com banco próprio; nunca use o banco de produção em preview).

| Variável | Obrigatória | Como obter |
|---|---|---|
| `DATABASE_URL` | sim | String do Neon |
| `AUTH_SECRET` | sim | Gere abaixo |
| `CRIPTO_CHAVE` | sim | Gere abaixo (32 bytes em base64; cifra token da Nuvemshop, CPF e Pix. **Se trocar depois, o que foi cifrado se perde**) |
| `APP_URL` | sim | Endereço público, ex.: `https://weecrea.vercel.app` (sai nos links dos e-mails) |
| `CRON_SECRET` | sim | Gere abaixo |
| `RESEND_API_KEY` | para e-mails | Chave do Resend. Sem ela, os e-mails (link de senha, aprovação) **não chegam**: só aparecem no log |
| `EMAIL_REMETENTE` | para e-mails | Ex.: `WEECREA <nao-responda@seu-dominio.com.br>` (domínio verificado no Resend) |
| `BLOB_READ_WRITE_TOKEN` | para vídeos | **Storage → Create → Blob** na Vercel |
| `NUVEMSHOP_APP_ID`, `NUVEMSHOP_CLIENT_SECRET`, `NUVEMSHOP_USER_AGENT` | M3 e M4 | Portal de Parceiros da Nuvemshop |
| `SENHA_EXEMPLO` | só para o seed | Senha das pessoas de exemplo (veja o passo 5) |

Gerar os segredos (PowerShell ou qualquer terminal com Node):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Rode uma vez para `AUTH_SECRET`, outra para `CRIPTO_CHAVE`, e use `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` para `CRON_SECRET`. Cole direto na Vercel; não salve em arquivo do projeto.

## Passo 4. Primeiro deploy
Faça o merge dos PRs na `main` (ou **Deployments → Redeploy**). No log do build deve aparecer `prisma migrate deploy` aplicando a migração `inicio`. Se falhar aqui, quase sempre é `DATABASE_URL` errada.

## Passo 5. Dados iniciais (uma vez)
O banco novo nasce vazio, então ninguém consegue entrar. Escolha um caminho:
- **Piloto com dados de exemplo:** no seu computador, com `DATABASE_URL` apontando para o banco de produção e `SENHA_EXEMPLO` definida, rode `npm run db:seed`. Cria as lojas, os creators e os 3 logins de exemplo (`loja@`, `creator@`, `weethub@exemplo.com`). **Troque essas senhas antes de abrir para clientes reais.**
- **Loja real:** crie só o acesso da Weethub e cadastre a loja pela área da Weethub (M11).

## Passo 6. Conferir no ar
- [ ] `/entrar` abre e o login funciona
- [ ] Como loja: criar uma campanha em `/loja/campanhas/nova`
- [ ] Abrir `/c/<slug-da-loja>`, cadastrar um creator de teste e ver na fila em `/loja/creators`
- [ ] Aprovar: o e-mail de senha chegou (precisa do Resend)
- [ ] O creator entra e aceita a campanha

## O que ainda NÃO funciona em produção
- **Nuvemshop (M3, M4):** não conecta nem recebe pedidos; cupons nascem só no nosso banco (`erro_sync`).
- **Vídeos (M8), painel (M9), financeiro (M10), Weethub (M11):** telas ainda com dados de exemplo.
- **Tarefas agendadas:** `/api/cron/saude` existe, mas o `vercel.json` ainda não tem `crons`. A reconciliação de pedidos e a liberação de comissões entram com M4 e M10.
- **Limite de envios do cadastro público:** fica na memória do servidor; na Vercel cada instância tem a sua. Protege de uso descuidado, não de ataque.

## Se algo der errado
- Voltar uma versão: **Deployments →** deploy anterior **→ Promote to Production**.
- Nunca rode `vercel deploy` de um computador com `.env` de produção na pasta sem conferir o `.vercelignore`.
