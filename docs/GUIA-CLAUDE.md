# WEECREA: guia de construção para o Claude Code

Nov 25, 2026 · @Francis

## Como usar este guia

Este guia junta o melhor do [repositório da equipe](https://github.com/SrLuizGuimaraes/weecrea) e da [especificação técnica](https://claude.ai/artifact/KNfm9BEtUxCAptYTbHAMnU) em um só lugar, pronto para a entrega de 02/12. Ele substitui o `docs/PROMPTS.md` atual.

1. Exporte este guia em Markdown e salve no repositório como `docs/GUIA-CLAUDE.md`.
2. O dono do M1 aplica primeiro as seções "Stack", "Contratos" e "Regras": elas mudam arquivos que todos usam.
3. Cada pessoa abre o Claude Code na pasta do projeto, cola o **prompt base** e, logo abaixo, o **bloco do seu módulo**.
4. As junções seguem o calendário: são três, e não uma só no dia 30.
5. Na véspera, o M11 roda o roteiro de teste do ciclo completo.

Quando este guia e a especificação técnica divergirem, vale este guia até 02/12. Depois, a especificação volta a ser a referência para as fases seguintes.

## O que veio de cada lado

O repositório acertou na organização do time; a especificação acertou nas regras e nos dados. A junção mantém a forma de trabalhar da equipe e troca o conteúdo raso pelo detalhado.

| Ponto | Fica do repositório | Fica da especificação | Ajuste da junção |
| --- | --- | --- | --- |
| Stack | Next.js, Prisma, Postgres no Neon, Vercel |  | Acrescenta Auth.js para login, Vercel Blob para vídeos e Resend para e-mail |
| Divisão do trabalho | 11 módulos, um dono cada, issues, PRs e painel |  | Telas ficam na pasta `src/app/` do Next.js; cada módulo é dono de rotas definidas |
| Integração | Dados de exemplo para trabalhar sem esperar | Teste do ciclo inteiro como critério de pronto | Três junções (27/11, 29/11 e 30/11) no lugar de uma só |
| Modelo de dados | Nomes em português, `contratos/tipos.ts` | Afiliação, itens do pedido, centavos, status da comissão, vídeo com status e direitos | `tipos.ts` ampliado, abaixo |
| Regras de negócio | "Só pedido pago conta comissão" | R-01 a R-46 | As regras do MVP viram funções em `src/dominio/`, cada uma com dono e teste |
| Nuvemshop | Conexão, produtos, cupons e webhook de pedidos | Assinatura dos webhooks, idempotência, reconciliação e webhooks de LGPD | Entram nas tarefas do M3 e do M4 |
| Vídeos | Envio, filtro e .zip (M8) | Biblioteca com status, direitos e coleções | M8 vira "Biblioteca de vídeos (básica)" |
| Linguagem | Prompts em linguagem simples, uma tarefa por vez | Critérios de aceite verificáveis | Cada bloco de módulo tem tarefas em ordem e um "pronto quando" testável |
| Visual | M2 com catálogo de componentes | Tema claro e escuro, padrões de tela | Sem mudança |

## Stack e estrutura do repositório

| Camada | Escolha | Observação |
| --- | --- | --- |
| Aplicação | Next.js (App Router) + TypeScript estrito | Server Actions para gravar, Server Components para ler |
| Banco | Postgres no Neon + Prisma | Um único `prisma/schema.prisma`, dono M1 |
| Login | Auth.js com e-mail e senha (senha com bcrypt) | Sessão guarda `usuarioId`, `perfil` e `lojaId` ou `creatorId` |
| Vídeos e imagens | Vercel Blob com upload direto do navegador | Permite arquivos grandes sem passar pelo servidor; miniatura tirada no navegador no momento do upload |
| E-mail | Resend | Convites, aprovação, link de senha |
| Tarefas agendadas | Vercel Cron chamando rotas protegidas por `CRON_SECRET` | Reconciliação de pedidos e liberação de comissões |
| Visual | Tailwind + componentes do M2 | Tema claro e escuro |
| Testes | Vitest para `src/dominio/` | Rodam em todo PR |

Convenções que valem para todos: dinheiro sempre em **centavos inteiros**; percentual em **pontos-base** (1% = 100); datas gravadas em UTC e mostradas no fuso `America/Sao_Paulo`; textos da tela em português; nomes de código em português, como no `tipos.ts`.

Variáveis de ambiente, sempre em `.env.example` e nunca no código: `DATABASE_URL`, `AUTH_SECRET`, `NUVEMSHOP_APP_ID`, `NUVEMSHOP_CLIENT_SECRET`, `NUVEMSHOP_USER_AGENT`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `CRON_SECRET`, `CRIPTO_CHAVE` (para guardar o token da Nuvemshop criptografado), `APP_URL`.

### Pastas

No Next.js, as telas precisam morar em `src/app/`. Por isso a regra "cada um na sua pasta" vira "cada um nas suas rotas e na sua pasta de módulo":

```
src/
  app/
    (publico)/c/[slug]/          M6  página de cadastro da loja
    (loja)/loja/painel/          M9
    (loja)/loja/biblioteca/      M8
    (loja)/loja/campanhas/       M5
    (loja)/loja/creators/        M7
    (loja)/loja/produtos/        M3
    (loja)/loja/financeiro/      M10
    (loja)/loja/conexoes/        M3
    (loja)/loja/configuracoes/   M6 (página) e M7 (critérios)
    (creator)/creator/inicio/    M9
    (creator)/creator/campanhas/ M5
    (creator)/creator/conteudos/ M8
    (creator)/creator/financeiro/ M10
    (weethub)/weethub/...        M11
    api/nuvemshop/oauth/         M3
    api/nuvemshop/webhooks/      M4
    api/cron/                    M4 e M10
    entrar/                      M1
  modulos/mX-nome/               componentes e serviços de cada módulo
  componentes/                   M2  visual compartilhado
  contratos/tipos.ts             M1  idioma comum (mudança só por PR avisado)
  dominio/                       regras de negócio, um arquivo por dono
  lib/                           M1  banco, login, cripto, dinheiro, datas
prisma/schema.prisma             M1
dados-exemplo/dados.json         M1  atualizado para o novo tipos.ts
```

Crie um arquivo `.github/CODEOWNERS` com esse mapa: o GitHub pede a revisão do dono quando alguém mexe em pasta alheia.

## Contratos: `tipos.ts` ampliado

Substitui o `contratos/tipos.ts` atual. Mantém os nomes em português e acrescenta o que faltava para as regras funcionarem: afiliação entre creator e loja, itens do pedido, valores em centavos, ciclo de vida da comissão, benefício estruturado, participação na campanha e vídeo com status e direitos. O M1 gera o `schema.prisma` a partir destes tipos e atualiza o `dados-exemplo/dados.json`.

```ts
// CONTRATOS: o idioma comum entre os módulos.
// Mudou algo aqui? Abra PR para o M1 e avise no grupo.

export type Perfil = 'LOJA' | 'CREATOR' | 'WEETHUB';
export type Centavos = number; // sempre inteiro: R$ 12,34 = 1234
export type Bps = number;      // pontos-base: 10% = 1000
export type DataISO = string;  // '2026-11-25T14:00:00Z' ou '2026-11-25' para dias
export type Rede = 'instagram' | 'tiktok';

export interface Usuario {
  id: string; email: string; nome: string; perfil: Perfil;
  lojaId?: string; creatorId?: string; // conforme o perfil
}

export interface CriteriosAprovacao {
  aprovacaoAutomatica: boolean; seguidoresMin: number; engajamentoMinBps: Bps;
  redesAceitas: Rede[]; segmentosAceitos: string[]; // vazio = todos
  exigeTerProduto: boolean;
}

export interface Loja {
  id: string; nome: string; slug: string;
  status: 'implantacao' | 'ativa' | 'suspensa' | 'cancelada';
  nuvemshopStoreId?: number; nuvemshopConectada: boolean;
  comissaoPadraoBps: Bps; cupomDescontoPct: number; retencaoDias: number; // padrão 7
  criterios: CriteriosAprovacao;
  paginaCadastro: { titulo: string; texto: string; aberta: boolean };
}

export interface Creator {
  id: string; usuarioId: string; nome: string; email: string; whatsapp: string;
  uf: string; cidade: string; bio: string; segmentos: string[];
  instagram?: { perfil: string; seguidores: number };
  tiktok?: { perfil: string; seguidores: number };
  engajamentoBps?: Bps; bloqueado: boolean;
}

// O status fica aqui, não no creator: um creator pode estar em várias lojas.
export interface Afiliacao {
  id: string; lojaId: string; creatorId: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'pausado' | 'removido';
  origem: 'link' | 'qr_code' | 'email' | 'pagina';
  campanhaConviteId?: string; temProduto: boolean;
  falhasCriterios: string[]; decisao?: 'automatica' | 'manual'; decididaEm?: DataISO;
  comissaoPropriaBps?: Bps;
}

export interface Cupom {
  id: string; lojaId: string; creatorId: string; codigo: string; nuvemshopId?: number;
  status: 'ativo' | 'pausado' | 'desativado' | 'erro_sync';
}

export interface Produto {
  id: string; lojaId: string; nuvemshopId: number; nome: string;
  categoria?: string; precoCentavos: Centavos; imagemUrl?: string;
}

export interface Beneficio {
  id: string; lojaId: string; nome: string;
  tipo: 'meta' | 'ranking' | 'periodo';
  recompensa: 'multiplicador' | 'bonus_bps' | 'premio';
  multiplicadorX100?: number; // 200 = comissão em dobro
  bonusBps?: Bps; topN?: number; premioDescricao?: string;
  periodoInicio?: DataISO; periodoFim?: DataISO;
}

export interface Campanha {
  id: string; lojaId: string; nome: string;
  produtoIds: string[]; // vazio = todos os produtos
  inicio: DataISO; fim: DataISO; // dias, fuso de São Paulo
  metaCentavos: Centavos; metaIndividualCentavos?: Centavos; comissaoBps: Bps;
  visibilidade: 'aberta' | 'so_convidados';
  entrega: 'publicar' | 'entregar_arquivo' | 'publicar_e_entregar';
  briefing: string; tags: string[]; beneficioIds: string[];
  status: 'rascunho' | 'agendada' | 'ativa' | 'encerrada' | 'cancelada';
}

export interface Participacao {
  campanhaId: string; creatorId: string;
  status: 'convidado' | 'aceito' | 'recusado' | 'removido';
  aceitaEm?: DataISO; comissaoBpsNoAceite?: Bps;
}

export interface ItemPedido {
  produtoNuvemshopId: number; produtoId?: string; nome: string;
  quantidade: number; precoUnitarioCentavos: Centavos;
}

// Regra de ouro: só pedido PAGO gera comissão. Cancelado ou devolvido estorna.
export interface Pedido {
  id: string; lojaId: string; nuvemshopId: number; numero: string;
  cupom?: string; creatorId?: string; campanhaId?: string;
  itens: ItemPedido[];
  subtotalCentavos: Centavos; descontoCentavos: Centavos; freteCentavos: Centavos;
  totalCentavos: Centavos; baseComissaoCentavos: Centavos; devolvidoCentavos: Centavos;
  ufComprador?: string;
  estado: 'aberto' | 'pago' | 'cancelado' | 'devolvido' | 'devolvido_parcial';
  criadoEm: DataISO; pagoEm?: DataISO; canceladoEm?: DataISO;
  autocompra: boolean; envioCreator: boolean;
}

export interface Comissao {
  id: string; lojaId: string; creatorId: string; pedidoId: string; campanhaId?: string;
  baseCentavos: Centavos; taxaBps: Bps; valorCentavos: Centavos; // estorno = negativo
  tipo: 'venda' | 'estorno';
  status: 'prevista' | 'liberada' | 'paga' | 'estornada';
  liberaEm: DataISO; retida: boolean; pagamentoId?: string;
}

export interface Pagamento {
  id: string; lojaId: string; creatorId: string; valorCentavos: Centavos;
  pagoEm: DataISO; forma: 'pix' | 'transferencia' | 'outro';
  comprovanteUrl?: string; registradoPor: string; comissaoIds: string[];
}

export interface Video {
  id: string; lojaId: string; campanhaId?: string; creatorId?: string;
  origem: 'creator' | 'upload_loja' | 'link';
  rede?: Rede; formato?: 'reels' | 'story' | 'feed' | 'tiktok';
  link?: string; arquivoUrl?: string; miniaturaUrl?: string;
  duracaoSeg?: number; tamanhoBytes?: number;
  tags: string[]; status: 'em_analise' | 'aprovado' | 'reprovado'; motivoReprovacao?: string;
  views?: number; curtidas?: number; comentarios?: number; publicadoEm?: DataISO;
  direito: 'organico' | 'organico_e_anuncio' | 'sem_direito'; direitoAte?: DataISO;
  enviadoEm: DataISO;
}

export interface Colecao { id: string; lojaId: string; nome: string; videoIds: string[] }
```

Restrições que o M1 coloca no banco: `Afiliacao` única por loja e creator; `Cupom.codigo` único por loja, sem diferenciar maiúsculas; `Pedido` único por loja e `nuvemshopId`; `Comissao` única por pedido e tipo; `Participacao` única por campanha e creator. Esses índices impedem duplicidade quando a Nuvemshop manda o mesmo aviso duas vezes.

## Regras de negócio compartilhadas

As regras ficam em `src/dominio/`, como funções puras (sem banco e sem tela), cada arquivo com um dono e testes. Telas e rotas só chamam essas funções. Assim, os 11 módulos usam a mesma interpretação. Os códigos (R-01 etc.) são os da especificação técnica.

| Arquivo | Dono | Regras |
| --- | --- | --- |
| `dominio/cupom.ts` | M3 | R-19 código do cupom |
| `dominio/atribuicao.ts` | M4 | R-01 a R-06: a quem e a qual campanha o pedido pertence |
| `dominio/campanha.ts` | M5 | R-12 status da campanha, R-13 o que pode mudar em campanha ativa, R-35 visibilidade |
| `dominio/criterios.ts` | M7 | R-22 a R-25: critérios e decisão de aprovação |
| `dominio/comissao.ts` | M10 | R-07 a R-11: percentual, cálculo, retenção, estorno |
| `dominio/dinheiro.ts` | M1 | Conversão para centavos e formatação em reais |

### O que cada regra diz

- **R-01. Venda atribuída:** o pedido pertence ao creator dono do cupom usado, comparando o código sem diferenciar maiúsculas. Sem cupom de creator, o pedido é guardado sem creator.
- **R-02.** Vários cupons no pedido: vale o primeiro que for de um creator.
- **R-03.** Só gera comissão se a afiliação estava `aprovado` ou `pausado` no pagamento e o creator não está bloqueado.
- **R-04. Autocompra:** comprador com o mesmo e-mail do creator não gera comissão.
- **R-05. Base da comissão:** subtotal menos desconto, sem frete, nunca negativa.
- **R-06. Campanha do pedido:** a campanha ativa, com o creator `aceito` antes do pagamento, data do pagamento dentro do período e ao menos um item entre os produtos da campanha. Empate: maior comissão; depois, a que começou antes.
- **R-07. Percentual:** o da campanha; sem campanha, o próprio da afiliação; sem os dois, o padrão da loja.
- **R-08. Cálculo:** `Math.round(base × bps / 10000)`, em centavos.
- **R-09. Retenção:** nasce `prevista`, com `liberaEm` = pagamento + dias de retenção (padrão 7); vira `liberada` no cron diário; só liberada entra em pagamento.
- **R-10. Estorno:** cancelado ou devolvido antes de pagar, a comissão vira `estornada`; devolução parcial recalcula proporcionalmente; se já estava paga, cria uma comissão `estorno` negativa, descontada no próximo pagamento.
- **R-11.** Comissão `retida` não é liberada até a loja revisar.
- **R-12. Status da campanha:** rascunho, agendada, ativa (no dia de início), encerrada (após o fim), cancelada (manual).
- **R-13.** Campanha ativa pode aumentar comissão e prazo e ganhar benefícios; não pode reduzir comissão, encurtar prazo nem tirar benefício.
- **R-19. Código do cupom:** primeiro nome sem acento, só letras, até 12, em maiúsculas, mais o desconto (`MARINA10`); se existir, acrescenta 2, 3… (`MARINA210`).
- **R-22. Critérios:** seguidores (o maior entre as redes aceitas), engajamento, rede aceita, segmento em comum (se a loja definiu) e ter o produto (se exigido). Cada falha vira um item de `falhasCriterios`.
- **R-23. Decisão:** aprovação automática ligada e nenhuma falha, entra `aprovado`; senão, `pendente`. O sistema nunca recusa sozinho.
- **R-25.** Recusado pode tentar de novo depois de 30 dias.
- **R-35. Visibilidade:** campanha aberta aparece para todos os aprovados; só convidados, apenas para os convidados.

### Assinaturas

O M1 cria os arquivos com estas assinaturas no primeiro dia, retornando valores de exemplo. Cada dono troca pelo cálculo real com testes.

```ts
// dominio/cupom.ts (M3)
export function gerarCodigoCupom(nomeCreator: string, descontoPct: number, codigosExistentes: string[]): string;

// dominio/atribuicao.ts (M4)
export function calcularBaseComissao(p: Pick<Pedido,'subtotalCentavos'|'descontoCentavos'>): Centavos;
export function atribuirPedido(
  pedido: Pedido, cupons: Cupom[], afiliacoes: Afiliacao[], creators: Creator[],
  campanhas: Campanha[], participacoes: Participacao[],
): { creatorId?: string; campanhaId?: string; geraComissao: boolean; motivo?: string };

// dominio/campanha.ts (M5)
export function statusDaCampanha(c: Campanha, hoje: DataISO): Campanha['status'];
export function validarEdicaoCampanhaAtiva(antes: Campanha, depois: Campanha): string[]; // lista de erros
export function campanhaVisivelPara(c: Campanha, creatorId: string, participacoes: Participacao[]): boolean;

// dominio/criterios.ts (M7)
export function avaliarCriterios(creator: Creator, afiliacao: Afiliacao, criterios: CriteriosAprovacao): string[];
export function decidirAprovacao(falhas: string[], criterios: CriteriosAprovacao): 'aprovado' | 'pendente';

// dominio/comissao.ts (M10)
export function taxaAplicada(campanha: Campanha | undefined, afiliacao: Afiliacao, loja: Loja): Bps;
export function calcularComissao(baseCentavos: Centavos, taxaBps: Bps): Centavos;
export function dataDeLiberacao(pagoEm: DataISO, retencaoDias: number): DataISO;
export function aplicarCancelamentoOuDevolucao(c: Comissao, pedido: Pedido): Comissao[]; // pode gerar estorno
```

Cada arquivo tem um `*.test.ts` ao lado, com pelo menos um teste por regra e os casos de borda: desconto maior que o subtotal, cupom em minúsculas, pedido pago antes do aceite, devolução parcial, estorno depois de pago.

## Módulos, dependências e calendário

Os 11 módulos do repositório continuam, com dois ajustes: o M8 vira biblioteca básica e o M9 passa a depender do M5 (o Início do creator mostra a meta da campanha).

| Módulo | Entrega | Depende de | Entrega para | Junção |
| --- | --- | --- | --- | --- |
| M1 Base e login | Projeto no ar, banco, login, perfis, `tipos.ts`, assinaturas do domínio, upload no Blob, cron | ninguém | todos | 1 |
| M2 Visual | Catálogo de componentes, menu das 3 áreas, tema claro e escuro | ninguém | todos | 1 |
| M3 Nuvemshop: conexão, produtos e cupons | Conectar, listar produtos, criar e pausar cupom, R-19 | M1 | M5, M6, M7 | 1 |
| M4 Nuvemshop: vendas | Webhooks seguros, pedidos com itens, reconciliação, R-01 a R-06 | M1, M3 | M9, M10 | 1 |
| M5 Campanhas e benefícios | Campanhas, benefícios, convites para campanha, aceite do creator | M1, M2, M3 | M6, M8, M9 | 2 |
| M6 Convite e página de cadastro | Página pública, formulário, link e QR code | M1, M2, M5 | M7 | 2 |
| M7 Aprovação e critérios | Critérios, aprovação automática, fila, cupom na aprovação | M3, M6 | M9, M10 | 2 |
| M8 Biblioteca de vídeos (básica) | Envio pelo creator, aprovação, filtros, coleções, .zip | M1, M2, M5 | apresentação | 2 |
| M9 Painel de vendas | Painel da loja e Início do creator | M4, M5, M7 | apresentação | 3 |
| M10 Financeiro e comissões | Comissões, retenção, estorno, carteira, pagamento, extrato | M4, M7 | apresentação | 3 |
| M11 Visão Weethub e testes | Telas da Weethub, loja piloto, roteiro de teste e ensaio | M1, M2 | sócios | 3 |

### Calendário

| Dia | O que acontece |
| --- | --- |
| Qua 25/11 e qui 26/11 | M1 publica a base, o `tipos.ts` novo, o `schema.prisma` e as assinaturas do domínio. M2 publica o catálogo. Os demais trabalham com os dados de exemplo e escrevem os testes das suas regras |
| Sex 27/11 | **Junção 1:** M1 a M4. Pronto quando a loja piloto está conectada e uma compra de teste com cupom vira pedido no sistema |
| Dom 29/11 | **Junção 2:** M5 a M8. Pronto quando uma campanha criada recebe um creator pela página de cadastro, ele é aprovado com cupom, aceita e envia um vídeo |
| Seg 30/11 | **Junção 3:** M9 a M11. Pronto quando a venda aparece no painel com a comissão certa e a Weethub vê a loja |
| Ter 01/12 | Roteiro de teste do ciclo completo na loja piloto, correções e ensaio |
| Qua 02/12 | Apresentação |

Quem atrasar a sua junção entra na seguinte, mas a junção anterior não espera: ela fecha com o que estiver pronto e o restante continua com dados de exemplo.

## Prompt base

Cole este texto no Claude Code e, logo abaixo, o bloco do seu módulo.

```text
Você é meu par de programação no projeto WEECREA: plataforma para lojas Nuvemshop gerirem creators de UGC (campanhas, cupons, vídeos, comissões e aprovação). Stack: Next.js (App Router) + TypeScript estrito + Prisma + Postgres no Neon + Auth.js + Vercel Blob + Vercel. Entrega em 02/12/2026.

Antes de qualquer código, leia: docs/GUIA-CLAUDE.md (este guia inteiro), README.md, docs/COMO-INTEGRAR.md, src/contratos/tipos.ts, prisma/schema.prisma, a pasta src/dominio/ e dados-exemplo/dados.json. Depois me diga, em 5 linhas, o que entendeu do meu módulo e o que vai fazer primeiro.

Regras de trabalho:
1. Trabalhe só nas rotas e na pasta do meu módulo, listadas no guia, e na minha branch. Se precisar mudar algo de outro módulo, do tipos.ts, do schema.prisma ou de src/dominio/ de outro dono, pare e me diga o que pedir a quem.
2. Regra de negócio nunca fica na tela nem na rota: use as funções de src/dominio/. Se a regra for minha, escreva o teste antes do código.
3. Enquanto a parte de outro módulo não existir, leia de dados-exemplo/dados.json por uma função simples que depois possa ser trocada pela real.
4. Dinheiro em centavos inteiros, percentual em pontos-base, datas em UTC mostradas no fuso de São Paulo.
5. Só pedido PAGO gera comissão; cancelado ou devolvido estorna.
6. Nunca coloque senha, token ou chave no código: use variáveis de ambiente e atualize o .env.example. O repositório é público.
7. Textos da tela em português do Brasil, com os componentes do M2. Funcione bem no celular.
8. Uma tarefa por vez: explique em linguagem simples o que fez, rode o projeto e os testes, faça commits pequenos e me diga qual caixinha da issue marcar.
9. Ao terminar uma parte, me ajude a abrir o Pull Request com o modelo do repositório e escreva no README do módulo, em até 5 linhas, como os outros usam o que você entregou.
10. Na dúvida sobre uma regra, não invente: anote a pergunta em docs/perguntas.md e siga com a opção que não mexe em dinheiro nem apaga dados.
```

## Blocos dos módulos

Cada bloco vai logo abaixo do prompt base. As tarefas estão na ordem em que devem ser feitas.

### M1. Base e login

```text
Meu módulo: M1, Base e login. Branch m1-base.
Sou dono de: src/app/entrar/, src/lib/, src/contratos/tipos.ts, prisma/schema.prisma, dados-exemplo/dados.json, .github/CODEOWNERS e src/dominio/dinheiro.ts.
Tela do protótipo: nenhuma; login e as 3 áreas vazias com o menu do M2.

Tarefas:
1. Criar o projeto Next.js com TypeScript estrito, subir na Vercel e ligar o Neon.
2. Substituir src/contratos/tipos.ts pela versão do guia e gerar o schema.prisma a partir dele, com as restrições de unicidade listadas no guia. Rodar a primeira migração.
3. Atualizar dados-exemplo/dados.json para o novo formato (3 lojas, 15 creators, afiliações, campanhas, 120 pedidos com itens, comissões e vídeos) e criar um seed que carrega esse arquivo no banco.
4. Criar os arquivos de src/dominio/ com as assinaturas do guia, devolvendo valores de exemplo, e src/dominio/dinheiro.ts completo com testes.
5. Login com e-mail e senha (Auth.js), 3 perfis e middleware: cada perfil só abre a sua área; o creator só vê seus dados; a loja só vê dados da própria loja.
6. Link para definir senha por e-mail (Resend), usado na aprovação do creator e no convite do dono da loja.
7. Upload direto para o Vercel Blob (função reutilizável) e rota de cron protegida por CRON_SECRET.
8. Criptografia do token da Nuvemshop (função cifrar/decifrar com CRIPTO_CHAVE).
9. CODEOWNERS com o mapa de pastas do guia. Avisar o time que a base está pronta.

Pronto quando: as 3 pessoas de exemplo entram e cada uma vê só a sua área; o seed carrega; os testes de dinheiro passam; um arquivo de 300 MB sobe para o Blob.
```

### M2. Visual da WEECREA

```text
Meu módulo: M2, Visual. Branch m2-visual.
Sou dono de: src/componentes/ e da página de catálogo em src/app/catalogo/.
Tela do protótipo: o estilo geral (fundo neutro, bordas finas, preto e branco com uma cor de destaque, cartões, tabelas, abas em pílula, menu lateral com ícones, cabeçalho de página em cartão).

Tarefas:
1. Cores e fontes (Inter) como variáveis, com tema claro e escuro e botão de troca que guarda a escolha.
2. Botões, campos, seleção, chips de filtro e etiquetas de status.
3. Tabelas com rolagem lateral no celular, abas e paginação.
4. Cartões, cartão de indicador, avisos, janela (modal) e mensagem rápida (toast).
5. Cartão vertical de vídeo (9:16) com miniatura, perfil, formato e caixa de seleção.
6. Menu lateral das 3 áreas e cabeçalho de página.
7. Página de catálogo com todos os componentes e o código de uso.

Pronto quando: a página de catálogo mostra todos os componentes nos dois temas e funciona em tela de celular.
```

### M3. Nuvemshop: conexão, produtos e cupons

```text
Meu módulo: M3. Branch m3-nuvemshop-cupons.
Sou dono de: src/app/api/nuvemshop/oauth/, src/app/(loja)/loja/conexoes/, src/app/(loja)/loja/produtos/, src/modulos/m3-nuvemshop/ e src/dominio/cupom.ts.
Tela do protótipo: Loja > Conexões e Loja > Produtos e cupons.

Tarefas:
1. Registrar o app no Portal de Parceiros da Nuvemshop e conferir na documentação oficial os escopos, o cabeçalho de autenticação (a Nuvemshop usa "Authentication: bearer") e os limites de requisição.
2. Cliente HTTP único para a API, que respeita o limite e tenta de novo em erro 429 e 5xx.
3. Botão Conectar: autorização, troca do código pelo token, token guardado criptografado, uma loja Nuvemshop só pode estar ligada a uma loja nossa.
4. Ao conectar, registrar os webhooks de pedidos (para o M4), de produtos e de desinstalação, e os obrigatórios de LGPD.
5. Importar e atualizar produtos (com categoria e imagem).
6. R-19 em src/dominio/cupom.ts com testes; criar, pausar, reativar e desativar cupom na loja, conferindo antes se o código já existe lá.
7. Telas Conexões e Produtos e cupons (com o status do cupom e o botão tentar de novo em erro).

Pronto quando: a loja piloto conecta, os produtos aparecem e um cupom criado pelo sistema existe na Nuvemshop e pode ser pausado.
```

### M4. Nuvemshop: vendas

```text
Meu módulo: M4. Branch m4-nuvemshop-vendas.
Sou dono de: src/app/api/nuvemshop/webhooks/, src/app/api/cron/reconciliar/, src/modulos/m4-vendas/ e src/dominio/atribuicao.ts.
Tela do protótipo: nenhuma; alimenta Painel e Financeiro.

Tarefas:
1. R-01 a R-06 em src/dominio/atribuicao.ts, com testes antes do código (cupom em minúsculas, dois cupons, autocompra, pedido pago antes do aceite, campanha sem produtos).
2. Rota de webhook que confere a assinatura HMAC (cabeçalho x-linkedstore-hmac-sha256 com o client secret), grava o aviso e responde rápido. Assinatura inválida: recusa.
3. Para cada aviso, buscar o pedido completo na API e gravar com itens, subtotal, desconto, frete, total, UF e datas, sem duplicar se o aviso vier repetido.
4. Tratar pago, cancelado, devolvido e devolvido em parte, chamando atribuirPedido e, no pagamento, avisando o M10 para gerar a comissão.
5. Cron a cada 6 horas que busca os pedidos dos últimos 7 dias, para cobrir aviso perdido.
6. Importação inicial dos pedidos dos últimos 90 dias ao conectar.
7. Responder aos webhooks de LGPD da Nuvemshop.

Pronto quando: uma compra de teste com cupom vira pedido com creator e campanha certos; cancelar muda o estado; o mesmo aviso enviado duas vezes não duplica.
```

### M5. Campanhas e benefícios

```text
Meu módulo: M5. Branch m5-campanhas.
Sou dono de: src/app/(loja)/loja/campanhas/, src/app/(creator)/creator/campanhas/, src/modulos/m5-campanhas/ e src/dominio/campanha.ts.
Tela do protótipo: Loja > Campanhas (Ativas, Futuras, Encerradas, Todas, Benefícios) e Creator > Campanhas.

Tarefas:
1. R-12, R-13 e R-35 em src/dominio/campanha.ts, com testes.
2. Lista de campanhas por aba, com meta e realizado.
3. Criar e editar campanha: nome, produtos (vários; vazio = todos), datas, meta geral e individual, comissão, visibilidade, tipo de entrega, tags, benefícios e briefing. Rascunho ou publicar. Em campanha ativa, travar o que R-13 proíbe.
4. Cadastro de benefícios (ao bater a meta, para os principais, por período), com os campos de cada tipo. Não excluir benefício em uso.
5. Detalhe da campanha: participantes, ranking, vídeos.
6. Convidar creators já aprovados para a campanha.
7. Tela do creator: campanhas disponíveis, participando, futuras e encerradas; aceitar com o briefing completo e a caixa de concordância, guardando a comissão do momento do aceite.

Pronto quando: a loja cria uma campanha com benefício e o creator aprovado a vê e aceita.
```

### M6. Convite e página de cadastro

```text
Meu módulo: M6. Branch m6-convite-cadastro.
Sou dono de: src/app/(publico)/c/[slug]/, a parte "Página de cadastro" de src/app/(loja)/loja/configuracoes/ e src/modulos/m6-cadastro/.
Tela do protótipo: Loja > Configurações > Página de cadastro e Creator > Página de cadastro.

Tarefas:
1. Página pública da loja, feita primeiro para celular: título, texto, destaques (comissão, cupom exclusivo, campanhas ativas), como funciona e o formulário. Página fechada ou loja suspensa mostra "Inscrições fechadas".
2. Formulário: nome, e-mail, WhatsApp, data de nascimento (só maiores de 18), UF e cidade, Instagram e TikTok com seguidores (ao menos um), "fale sobre você" (30 a 500 caracteres), segmentos (1 a 3), se já tem o produto, foto e aceite dos termos.
3. E-mail já cadastrado: pedir login e só perguntar o que é próprio da loja.
4. Ao enviar: criar creator e afiliação e chamar o M7 para decidir. Mostrar "aprovado" com o cupom ou "em análise".
5. Link de convite (com campanha opcional), QR code para baixar e convite por e-mail para até 50 endereços.
6. Configuração de título, texto e página aberta ou fechada.
7. Proteção simples contra spam: campo isca e limite de envios por IP.

Pronto quando: abrir o link no celular, preencher e o cadastro chegar à loja, aprovado ou na fila.
```

### M7. Aprovação e critérios

```text
Meu módulo: M7. Branch m7-aprovacao.
Sou dono de: src/app/(loja)/loja/creators/, a parte "Aprovação" de src/app/(loja)/loja/configuracoes/, src/modulos/m7-aprovacao/ e src/dominio/criterios.ts.
Tela do protótipo: Loja > Configurações (critérios) e Loja > Creators (Aprovação e Ativos).

Tarefas:
1. R-22, R-23 e R-25 em src/dominio/criterios.ts, com testes.
2. Tela de critérios: aprovação automática, seguidores mínimos, engajamento mínimo, redes, segmentos e exigir o produto. Ao salvar com a automática ligada, reavaliar a fila e dizer quantos foram aprovados.
3. Fila de aprovação com o primeiro critério não atendido, e o perfil completo para decidir (bio, segmentos, redes com link, contatos, se tem o produto, critérios atendidos e não atendidos).
4. Aprovar: mudar a afiliação, pedir o cupom ao M3 e mandar o e-mail com o link de senha e o cupom. Recusar: motivo interno opcional e e-mail cordial.
5. Lista de ativos com seguidores, vídeos, pedidos, vendas e cupom; pausar e remover com motivo (cupom pausado ou desativado na loja).

Pronto quando: quem atende aos critérios é aprovado na hora com cupom na loja; os outros ficam na fila com o motivo.
```

### M8. Biblioteca de vídeos (básica)

```text
Meu módulo: M8. Branch m8-biblioteca.
Sou dono de: src/app/(loja)/loja/biblioteca/, src/app/(creator)/creator/conteudos/ e src/modulos/m8-biblioteca/.
Tela do protótipo: Loja > Menções (agora Biblioteca) e Creator > Conteúdos.

Tarefas:
1. Creator envia vídeo para uma campanha aceita: link (Instagram ou TikTok) quando a campanha pede publicação e arquivo quando pede entrega, com upload direto para o Blob e barra de progresso. Miniatura tirada no navegador. Entra "em análise" com o direito de uso da campanha.
2. Lista do creator com status, motivo de reprovação e métricas que ele pode atualizar.
3. Biblioteca da loja em grade e lista, agrupada por campanha, com filtros por campanha, tag da campanha, creator, rede e status, e busca por creator.
4. Aprovar e reprovar (motivo obrigatório na reprovação).
5. Seleção de um, vários ou todos do filtro; baixar um direto e vários em .zip.
6. Coleções manuais: criar, adicionar vídeos e abrir a coleção.
7. Upload pela loja de vídeos que chegaram por fora (WhatsApp, e-mail).

Pronto quando: o creator envia, a loja filtra por campanha, aprova e baixa vários em .zip.
```

### M9. Painel de vendas

```text
Meu módulo: M9. Branch m9-painel.
Sou dono de: src/app/(loja)/loja/painel/, src/app/(creator)/creator/inicio/ e src/modulos/m9-painel/.
Tela do protótipo: Loja > Painel e Creator > Início.

Tarefas:
1. Filtros: 7, 30 e 90 dias, De e Até livres, creator, e a troca entre "por período" e "por creator".
2. Indicadores: vendas (GMV atribuído, base de comissão de pedidos pagos menos estornos), pedidos com cupom, ticket médio, creators ativos, vídeos recebidos, comissões a pagar.
3. Gráfico de vendas por dia (por semana acima de 45 dias) e barras por creator.
4. Ranking de creators e produtos mais vendidos, somando os itens dos pedidos.
5. Mapa do Brasil com os 27 estados pela UF dos creators aprovados, com o ranking de estados ao lado.
6. Início do creator: seletor de loja, cupom com copiar, indicadores do mês, posição no ranking (sem nomes dos outros), meta individual de cada campanha e convites pendentes.

Pronto quando: com os pedidos de exemplo, os números batem com uma conferência feita à mão em qualquer período e com qualquer creator.
```

### M10. Financeiro e comissões

```text
Meu módulo: M10. Branch m10-financeiro.
Sou dono de: src/app/(loja)/loja/financeiro/, src/app/(creator)/creator/financeiro/, src/app/api/cron/liberar/, src/modulos/m10-financeiro/ e src/dominio/comissao.ts.
Tela do protótipo: Loja > Financeiro (Visão geral, Faturas, Carteira de creators) e Creator > Financeiro.

Tarefas:
1. R-07 a R-11 em src/dominio/comissao.ts, com testes antes do código (arredondamento, devolução parcial, estorno depois de pago).
2. Gerar a comissão quando o M4 avisa que o pedido foi pago, e aplicar cancelamento e devolução.
3. Cron diário que libera as comissões vencidas e não retidas.
4. Visão geral da loja: a pagar (liberado), em retenção, pago no mês e extrato.
5. Carteira de creators: por creator, vendas, previsto, liberado, pago e saldo; pagamento individual com comprovante e pagamento em lote com CSV (nome, chave Pix, valor), confirmado só depois.
6. Financeiro do creator: a receber, em retenção (com a data), recebido, extrato e dados de pagamento (CPF e Pix guardados criptografados, mostrados só os 4 últimos dígitos).
7. Aba Faturas da Weethub com dados de exemplo (a cobrança real fica para depois de 02/12).

Pronto quando: a comissão aparece no pagamento do pedido, some ao cancelar, libera após a retenção e zera ao marcar como pago.
```

### M11. Visão Weethub, testes e apresentação

```text
Meu módulo: M11. Branch m11-weethub.
Sou dono de: src/app/(weethub)/weethub/, src/modulos/m11-weethub/ e docs/roteiro-teste.md.
Tela do protótipo: toda a visão Weethub (Painel, Empresas, Creators, Receita).

Tarefas:
1. Empresas: lista com status, conexão, creators, campanhas e vendas; criar empresa e convidar o dono por e-mail; ficha com resumo e integração.
2. Ver como cliente: abrir a área de uma loja só para leitura, com faixa no topo.
3. Painel Weethub: empresas por status, vendas totais, creators na base e receita estimada.
4. Creators da base: lista de todas as lojas, com filtros.
5. Receita com valores de exemplo, por empresa.
6. Escolher e preparar a loja piloto com o grupo.
7. Transformar o roteiro de teste do guia em docs/roteiro-teste.md e rodá-lo em 01/12.
8. Roteiro da apresentação, contando o ciclo na ordem do teste.

Pronto quando: o roteiro de teste roda inteiro na loja piloto sem travar e a apresentação está ensaiada.
```

## Roteiro de teste do ciclo completo

Rodado pelo M11 em 01/12, na loja piloto, com uma pessoa fazendo o papel de cada perfil. Cada passo tem um resultado esperado; se falhar, anota o módulo responsável e segue.

| Passo | Quem | Ação | Resultado esperado | Módulo |
| --- | --- | --- | --- | --- |
| 1 | Weethub | Cria a empresa e convida o dono | Dono recebe o e-mail e define a senha | M11, M1 |
| 2 | Loja | Conecta a Nuvemshop | Produtos aparecem; conexão "conectada" | M3 |
| 3 | Loja | Liga a aprovação automática com 5 mil seguidores mínimos | Critérios salvos | M7 |
| 4 | Loja | Cria uma campanha com meta individual e benefício de comissão em dobro | Campanha agendada ou ativa | M5 |
| 5 | Loja | Gera o QR code do convite | Imagem baixada | M6 |
| 6 | Creator A | Abre o QR no celular e se cadastra com 12 mil seguidores | Aprovado na hora, cupom na tela e na Nuvemshop | M6, M7, M3 |
| 7 | Creator B | Cadastra-se com 2 mil seguidores | Fica "em análise" com o motivo; a loja aprova à mão | M7 |
| 8 | Creator A | Define a senha, aceita a campanha e envia um vídeo | Vídeo "em análise" na biblioteca | M5, M8 |
| 9 | Loja | Aprova o vídeo e baixa dois vídeos em .zip | Arquivo abre com os dois vídeos | M8 |
| 10 | Cliente final | Compra na loja com o cupom do Creator A | Pedido no sistema, atribuído ao creator e à campanha | M4 |
| 11 | Loja | Abre o Painel | Venda no gráfico, no ranking e nos produtos | M9 |
| 12 | Loja | Abre o Financeiro | Comissão prevista com o valor certo | M10 |
| 13 | Cliente final | Faz uma segunda compra e a loja cancela | Comissão dessa compra estornada | M4, M10 |
| 14 | Loja | Marca a comissão liberada como paga (para o teste, retenção de 0 dia) | Saldo zera; creator vê o pagamento | M10 |
| 15 | Weethub | Abre o painel e "ver como cliente" da loja piloto | Números iguais aos da loja, sem poder editar | M11 |

O teste passa quando os 15 passos funcionam em sequência, sem ninguém mexer no banco à mão.

## Depois de 02/12

O que ficou fora segue a ordem da [especificação técnica](https://claude.ai/artifact/KNfm9BEtUxCAptYTbHAMnU), que já está escrita com o mesmo modelo de dados ampliado:

1. **Dinheiro completo:** apuração dos benefícios no fim da campanha, antifraude de cupom, membros da loja com papéis e a cobrança real da Weethub (planos, faturas, inadimplência).
2. **Biblioteca completa e envio de produtos:** direitos de uso com validade, códigos de anúncio em parceria, métricas de anúncio, coleções inteligentes, links externos, IA que confere o vídeo com o briefing e envio de produto ao creator.
3. **Gestão Weethub:** CRM de vendas da plataforma, relatórios dos cinco ganhos, operação, auditoria e equipe.
4. **Depois do MVP:** marketplace, conexão com Instagram e TikTok, fatura única com repasse e vitrine de vídeos na loja.

Três pontos técnicos para rever logo depois da apresentação: segurança de acesso também no banco (hoje fica só no código), processamento de vídeo em serviço próprio para gerar versão leve e transcrição, e fila de tarefas com novas tentativas para as chamadas à Nuvemshop.
