# Prompts por módulo

Como usar: instale o Claude Code (ou use o Claude), abra a pasta do projeto clonado (`git clone https://github.com/SrLuizGuimaraes/weecrea`), copie **só o prompt do seu módulo** e cole.
O protótipo (arquivo `Weethub Creators, protótipo.html`) não está no GitHub: peça o arquivo ao grupo e deixe-o aberto no navegador para comparar.

## M1. Base e login

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M1: Base e login.
Trabalhe somente na pasta modulos/m1-base/ e na branch m1-base. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m1-base/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Criar o projeto, colocar no ar, banco de dados e login com 3 perfis (loja, creator, Weethub).
Tela do protótipo para reproduzir: (sem tela do protótipo; faça login e as 3 áreas vazias).
Pronto quando: As 3 pessoas de exemplo entram e cada uma vê só a sua área.
Eu dependo de: ninguém. Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: todos. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Criar o projeto Next.js e subir na Vercel
2. Criar o banco (Neon) e ligar
3. Login com e-mail e senha
4. 3 perfis: LOJA, CREATOR, WEETHUB
5. Cada perfil só vê a sua área
6. Avisar o time que a base está pronta

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M2. Visual da WEECREA

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M2: Visual da WEECREA.
Trabalhe somente na pasta modulos/m2-visual/ e na branch m2-visual. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m2-visual/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Cores, letras, botões, tabelas, abas, cartões, avisos e menu lateral, iguais à identidade visual, com tema claro e escuro.
Tela do protótipo para reproduzir: o estilo geral do protótipo (cores, botões, tabelas, abas, cartões, menu lateral, tema claro/escuro).
Pronto quando: Existe uma página de catálogo com todos os componentes para os outros copiarem.
Eu dependo de: ninguém. Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: todos. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Definir cores e fontes da identidade
2. Botões, campos e etiquetas
3. Tabelas e abas
4. Cartões, avisos e janela (modal)
5. Menu lateral das 3 visões
6. Tema claro e escuro
7. Página de catálogo dos componentes

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M3. Nuvemshop: conexão, produtos e cupons

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M3: Nuvemshop: conexão, produtos e cupons.
Trabalhe somente na pasta modulos/m3-nuvemshop-cupons/ e na branch m3-nuvemshop-cupons. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m3-nuvemshop-cupons/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Botão Conectar Nuvemshop, trazer a lista de produtos e criar cupom na loja.
Tela do protótipo para reproduzir: Loja > Conexões e Loja > Produtos e cupons.
Pronto quando: Um produto da loja de teste aparece e um cupom criado pelo sistema existe na Nuvemshop.
Eu dependo de: M1 (Base e login). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: M5 (Campanhas e benefícios), M6 (Convite e página de cadastro), M7 (Aprovação e critérios). Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Registrar o app na Nuvemshop
2. Botão Conectar e guardar o acesso
3. Listar produtos
4. Criar cupom para um creator
5. Tela Conexões
6. Tela Produtos e cupons

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M4. Nuvemshop: vendas (pedidos)

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M4: Nuvemshop: vendas (pedidos).
Trabalhe somente na pasta modulos/m4-nuvemshop-vendas/ e na branch m4-nuvemshop-vendas. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m4-nuvemshop-vendas/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Receber da Nuvemshop cada pedido com cupom, marcar pago, cancelado ou devolvido e guardar valor, estado e UF.
Tela do protótipo para reproduzir: (sem tela; alimenta Painel e Financeiro).
Pronto quando: Uma compra de teste com cupom vira pedido no sistema e cancelar muda o estado.
Eu dependo de: M1 (Base e login), M3 (Nuvemshop: conexão, produtos e cupons). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: M9 (Painel de vendas), M10 (Financeiro e comissões). Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Receber aviso (webhook) de pedido
2. Guardar pedido com cupom, valor e estado
3. Tratar pago, cancelado e devolvido
4. Guardar o estado (UF) do comprador
5. Teste com compra real de teste

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M5. Campanhas e benefícios

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M5: Campanhas e benefícios.
Trabalhe somente na pasta modulos/m5-campanhas/ e na branch m5-campanhas. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m5-campanhas/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Criar e editar campanhas (produto, meta, comissão, datas, briefing, tags) e benefícios.
Tela do protótipo para reproduzir: Loja > Campanhas (abas Ativas, Futuras, Encerradas, Todas, Benefícios) e Creator > Campanhas.
Pronto quando: A loja cria uma campanha e o creator aceita.
Eu dependo de: M1 (Base e login), M2 (Visual da WEECREA), M3 (Nuvemshop: conexão, produtos e cupons). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: M6 (Convite e página de cadastro), M8 (Vídeos (menções)). Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Lista de campanhas (Ativas, Futuras, Encerradas)
2. Criar e editar campanha
3. Cadastro de benefícios
4. Tags da campanha
5. Tela do creator: aceitar campanha

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M6. Convite e página de cadastro

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M6: Convite e página de cadastro.
Trabalhe somente na pasta modulos/m6-convite-cadastro/ e na branch m6-convite-cadastro. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m6-convite-cadastro/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Link e QR code do convite e a página pública da loja onde o creator se cadastra.
Tela do protótipo para reproduzir: Loja > Configurações > Página de cadastro e Creator > Página de cadastro.
Pronto quando: Abrir o link, preencher e o cadastro chega na loja.
Eu dependo de: M1 (Base e login), M2 (Visual da WEECREA), M5 (Campanhas e benefícios). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: M7 (Aprovação e critérios). Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Página pública da loja
2. Formulário do creator
3. Gerar link do convite
4. Gerar QR code
5. Configurar título e texto da página

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M7. Aprovação e critérios

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M7: Aprovação e critérios.
Trabalhe somente na pasta modulos/m7-aprovacao/ e na branch m7-aprovacao. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m7-aprovacao/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Critérios mínimos, aprovação automática e fila de análise manual. Ao aprovar, pede o cupom ao M3.
Tela do protótipo para reproduzir: Loja > Configurações (critérios) e Loja > Creators (abas Aprovação e Ativos).
Pronto quando: Quem atende aos critérios é aprovado na hora; os outros ficam na fila.
Eu dependo de: M3 (Nuvemshop: conexão, produtos e cupons), M6 (Convite e página de cadastro). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: M9 (Painel de vendas), M10 (Financeiro e comissões). Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Tela de critérios (seguidores, engajamento, redes, segmentos)
2. Aprovação automática
3. Fila: aprovar e recusar
4. Lista de creators ativos
5. Pedir o cupom ao aprovar

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M8. Vídeos (menções)

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M8: Vídeos (menções).
Trabalhe somente na pasta modulos/m8-videos/ e na branch m8-videos. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m8-videos/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Creator envia vídeo por link ou arquivo; a loja filtra, seleciona e baixa um, vários (.zip) ou todos.
Tela do protótipo para reproduzir: Loja > Menções e Creator > Conteúdos.
Pronto quando: Creator envia, loja filtra por campanha e baixa.
Eu dependo de: M1 (Base e login), M2 (Visual da WEECREA), M5 (Campanhas e benefícios). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: apresentação. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Creator: enviar por link
2. Creator: enviar arquivo
3. Loja: galeria com filtros (campanha, tag, rede)
4. Selecionar vários
5. Baixar em .zip

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M9. Painel de vendas

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M9: Painel de vendas.
Trabalhe somente na pasta modulos/m9-painel/ e na branch m9-painel. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m9-painel/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Painel da loja (período, creator, ranking, produtos, mapa por estado) e tela Início do creator.
Tela do protótipo para reproduzir: Loja > Painel e Creator > Início.
Pronto quando: Com pedidos de exemplo, números e gráficos aparecem certos.
Eu dependo de: M4 (Nuvemshop: vendas (pedidos)), M7 (Aprovação e critérios). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: apresentação. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Filtros de período e creator
2. Cartões: vendas, pedidos, creators, comissões
3. Ranking de creators
4. Produtos mais vendidos
5. Mapa por estado
6. Início do creator (cupom, vendas, meta)

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M10. Financeiro e comissões

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M10: Financeiro e comissões.
Trabalhe somente na pasta modulos/m10-financeiro/ e na branch m10-financeiro. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m10-financeiro/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Calcular comissão (só pedido pago, desconta cancelamento), carteira de creators, marcar como pago e extrato.
Tela do protótipo para reproduzir: Loja > Financeiro (Visão geral, Faturas, Carteira de creators) e Creator > Financeiro.
Pronto quando: A comissão aparece, some ao cancelar e zera ao marcar como pago.
Eu dependo de: M4 (Nuvemshop: vendas (pedidos)), M7 (Aprovação e critérios). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: apresentação. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Cálculo de comissão por pedido pago
2. Estorno em cancelamento e devolução
3. Carteira de creators
4. Marcar como pago
5. Extrato
6. Financeiro do creator

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

## M11. Visão Weethub, testes e apresentação

```text
Você é meu par de programação no projeto WEECREA (plataforma para lojas Nuvemshop gerirem creators de UGC: campanhas, cupons, vídeos, comissões). Stack: Next.js (App Router) + TypeScript + Prisma + Postgres (Neon) + Vercel. Entrega em 02/12/2026.

Eu sou responsável SÓ pelo módulo M11: Visão Weethub, testes e apresentação.
Trabalhe somente na pasta modulos/m11-weethub/ e na branch m11-weethub. Não altere pastas de outros módulos. Se precisar mudar algo de outro módulo ou de contratos/tipos.ts, pare e me avise.

Antes de começar, leia: README.md, docs/COMO-INTEGRAR.md, modulos/m11-weethub/README.md, contratos/tipos.ts e dados-exemplo/dados.json.

O que é: Telas da Weethub (Painel, Empresas, Creators, Receita), testes do ciclo inteiro, loja piloto e roteiro da apresentação.
Tela do protótipo para reproduzir: toda a visão Weethub (Painel, Empresas, Creators, Receita).
Pronto quando: O ciclo completo roda sem travar e o roteiro está ensaiado.
Eu dependo de: M1 (Base e login), M2 (Visual da WEECREA). Enquanto não existirem, use os dados de dados-exemplo/dados.json atrás de uma função simples que depois possa ser trocada pelo dado real.
Eu entrego para: sócios. Exponha funções/rotas claras e documente em 5 linhas no README do módulo como usá-las.

Regras: use os tipos de contratos/tipos.ts; comissão só conta pedido PAGO (cancelado/devolvido estorna); nunca coloque senhas ou chaves no código (use variáveis de ambiente e .env.example); texto da interface em português do Brasil; use o visual do M2 quando existir.

Tarefas (marque na issue do GitHub conforme concluir):
1. Painel Weethub
2. Empresas
3. Creators da base
4. Receita
5. Escolher a loja piloto
6. Roteiro de testes do ciclo
7. Roteiro e slides da apresentação

Trabalhe uma tarefa por vez, explique em linguagem simples o que fez, rode o projeto para testar, faça commits pequenos e, ao fim de cada tarefa, me diga qual caixinha da issue marcar. Ao terminar uma parte, me ajude a abrir o Pull Request usando o modelo do repositório.
```

