# Nuvemshop: como configurar e o que confirmar (M3 e M4)

O código está pronto e testado com a API simulada. **Ele ainda não falou com a Nuvemshop de verdade**: faltam as chaves do app e uma loja de teste. Este guia diz o que fazer quando as tiverem.

## 1. No Portal de Parceiros da Nuvemshop
Crie (ou abra) o app e configure:

| Campo | Valor |
|---|---|
| URL de redirecionamento (OAuth) | `https://SEU-DOMINIO/api/nuvemshop/oauth` |
| Escopos | `read_products`, `read_orders`, `read_coupons`, `write_coupons` |
| URLs de LGPD (store redact, customer redact, customers data request) | `https://SEU-DOMINIO/api/nuvemshop/webhooks` (as três) |

Depois de mudar escopos, a loja precisa **reinstalar o app** para receber um token novo.
Copie o **App ID** e o **Client Secret** para as variáveis da Vercel (veja `DEPLOY-VERCEL.md`).

## 2. Variáveis
`NUVEMSHOP_APP_ID`, `NUVEMSHOP_CLIENT_SECRET`, `NUVEMSHOP_USER_AGENT` (ex.: `WEECREA (contato@seu-dominio.com.br)`; a Nuvemshop responde erro sem ele), `APP_URL` (precisa ser **HTTPS**, senão os webhooks não são registrados) e, opcional, `NUVEMSHOP_API_VERSION` (padrão `2025-03`).

## 3. Como funciona
- **Conectar:** a loja clica em Conectar (Conexões). O app a leva à Nuvemshop, ela autoriza e volta com um código. Trocamos por um token (guardado cifrado), registramos os webhooks, importamos os produtos e os pedidos dos últimos 90 dias e criamos os cupons que estavam esperando. O fluxo leva um `state` assinado, bom por 10 minutos e preso à loja que clicou.
- **Webhooks:** a Nuvemshop avisa em `/api/nuvemshop/webhooks`. Conferimos a assinatura, gravamos o aviso e respondemos na hora; o pedido é buscado e gravado depois. O mesmo aviso repetido não duplica.
- **Cupons:** ao aprovar um creator, o cupom é criado na loja (R-19). Se o código já existir lá, o sistema escolhe outro. Falhou? Fica `erro_sync` com o motivo e botão "Tentar de novo".
- **Conferência diária** (`/api/cron/reconciliar`, 6h): busca os pedidos que mudaram nos últimos 7 dias. Está **diária** porque o plano gratuito da Vercel não aceita frequência maior; no plano Pro dá para trocar para `0 */6 * * *` no `vercel.json`.

## 4. O que confirmar com uma loja de teste (suposições)
A documentação que consegui abrir é da versão **2025-03, marcada como antiga** (a estável atual, 2026-11, não carregou) e não trazia um exemplo completo de pedido. Antes do piloto, faça uma compra de teste e confira:

1. **Assinatura do webhook:** o cabeçalho `x-linkedstore-hmac-sha256` aceito em hexadecimal ou base64. Se todo aviso real der 401, o formato é outro.
2. **State no OAuth:** o código supõe que a Nuvemshop devolve o parâmetro `state` que enviamos. Se voltar sem ele, a conexão falha com "O pedido de conexão expirou".
3. **Desconto do pedido:** usamos o campo `discount`; se ele não incluir o cupom, a base da comissão sai errada. Compare com o valor do pedido na Nuvemshop.
4. **Frete e UF:** `shipping_cost_customer` e `shipping_address.province`.
5. **Pausar cupom:** usamos `PUT /coupons/{id}` com `valid: false/true`. A documentação não descreve a pausa. Se a Nuvemshop recusar, o cupom não muda de estado aqui e a loja vê o erro.
6. **Reembolso parcial:** lido de `GET /orders/{id}/history/values` (`total_paid_diff` negativo).
7. **Tamanho dos números:** `Pedido.nuvemshopId` e `Cupom.nuvemshopId` são inteiros de 32 bits (até 2,1 bilhões). Confira se os IDs da loja cabem; se não, é preciso migrar para 64 bits (`BigInt`) antes de importar.

## 5. Ainda não existe
- **Comissão no banco (M10):** o M4 grava e atribui o pedido e chama `aoGravarPedido` (`src/modulos/m4-vendas/gancho-financeiro.ts`), que hoje não faz nada. O M10 preenche.
- **Teste real:** nada disto foi exercitado contra a Nuvemshop de verdade.
