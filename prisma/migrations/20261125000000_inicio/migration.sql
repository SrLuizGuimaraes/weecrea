-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('LOJA', 'CREATOR', 'WEETHUB');

-- CreateEnum
CREATE TYPE "StatusLoja" AS ENUM ('implantacao', 'ativa', 'suspensa', 'cancelada');

-- CreateEnum
CREATE TYPE "Rede" AS ENUM ('instagram', 'tiktok');

-- CreateEnum
CREATE TYPE "StatusAfiliacao" AS ENUM ('pendente', 'aprovado', 'recusado', 'pausado', 'removido');

-- CreateEnum
CREATE TYPE "OrigemAfiliacao" AS ENUM ('link', 'qr_code', 'email', 'pagina');

-- CreateEnum
CREATE TYPE "Decisao" AS ENUM ('automatica', 'manual');

-- CreateEnum
CREATE TYPE "StatusCupom" AS ENUM ('ativo', 'pausado', 'desativado', 'erro_sync');

-- CreateEnum
CREATE TYPE "TipoBeneficio" AS ENUM ('meta', 'ranking', 'periodo');

-- CreateEnum
CREATE TYPE "RecompensaBeneficio" AS ENUM ('multiplicador', 'bonus_bps', 'premio');

-- CreateEnum
CREATE TYPE "Visibilidade" AS ENUM ('aberta', 'so_convidados');

-- CreateEnum
CREATE TYPE "Entrega" AS ENUM ('publicar', 'entregar_arquivo', 'publicar_e_entregar');

-- CreateEnum
CREATE TYPE "StatusCampanha" AS ENUM ('rascunho', 'agendada', 'ativa', 'encerrada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusParticipacao" AS ENUM ('convidado', 'aceito', 'recusado', 'removido');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('aberto', 'pago', 'cancelado', 'devolvido', 'devolvido_parcial');

-- CreateEnum
CREATE TYPE "TipoComissao" AS ENUM ('venda', 'estorno');

-- CreateEnum
CREATE TYPE "StatusComissao" AS ENUM ('prevista', 'liberada', 'paga', 'estornada');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('pix', 'transferencia', 'outro');

-- CreateEnum
CREATE TYPE "OrigemVideo" AS ENUM ('creator', 'upload_loja', 'link');

-- CreateEnum
CREATE TYPE "FormatoVideo" AS ENUM ('reels', 'story', 'feed', 'tiktok');

-- CreateEnum
CREATE TYPE "StatusVideo" AS ENUM ('em_analise', 'aprovado', 'reprovado');

-- CreateEnum
CREATE TYPE "DireitoVideo" AS ENUM ('organico', 'organico_e_anuncio', 'sem_direito');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "senhaHash" TEXT,
    "lojaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenSenha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenSenha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loja" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "StatusLoja" NOT NULL DEFAULT 'implantacao',
    "nuvemshopStoreId" INTEGER,
    "nuvemshopConectada" BOOLEAN NOT NULL DEFAULT false,
    "nuvemshopTokenCifrado" TEXT,
    "comissaoPadraoBps" INTEGER NOT NULL DEFAULT 1000,
    "cupomDescontoPct" INTEGER NOT NULL DEFAULT 10,
    "retencaoDias" INTEGER NOT NULL DEFAULT 7,
    "aprovacaoAutomatica" BOOLEAN NOT NULL DEFAULT false,
    "seguidoresMin" INTEGER NOT NULL DEFAULT 0,
    "engajamentoMinBps" INTEGER NOT NULL DEFAULT 0,
    "redesAceitas" "Rede"[] DEFAULT ARRAY['instagram', 'tiktok']::"Rede"[],
    "segmentosAceitos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exigeTerProduto" BOOLEAN NOT NULL DEFAULT false,
    "paginaTitulo" TEXT NOT NULL DEFAULT 'Seja creator da nossa loja',
    "paginaTexto" TEXT NOT NULL DEFAULT '',
    "paginaAberta" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "cidade" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "segmentos" TEXT[],
    "instagramPerfil" TEXT,
    "instagramSeguidores" INTEGER,
    "tiktokPerfil" TEXT,
    "tiktokSeguidores" INTEGER,
    "engajamentoBps" INTEGER,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "nascimento" DATE,
    "fotoUrl" TEXT,
    "cpfCifrado" TEXT,
    "pixCifrado" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Afiliacao" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "StatusAfiliacao" NOT NULL DEFAULT 'pendente',
    "origem" "OrigemAfiliacao" NOT NULL,
    "campanhaConviteId" TEXT,
    "temProduto" BOOLEAN NOT NULL DEFAULT false,
    "falhasCriterios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "decisao" "Decisao",
    "decididaEm" TIMESTAMP(3),
    "comissaoPropriaBps" INTEGER,
    "motivoInterno" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Afiliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cupom" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigoNormalizado" TEXT NOT NULL,
    "nuvemshopId" INTEGER,
    "status" "StatusCupom" NOT NULL DEFAULT 'ativo',
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cupom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "nuvemshopId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "precoCentavos" INTEGER NOT NULL,
    "imagemUrl" TEXT,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficio" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoBeneficio" NOT NULL,
    "recompensa" "RecompensaBeneficio" NOT NULL,
    "multiplicadorX100" INTEGER,
    "bonusBps" INTEGER,
    "topN" INTEGER,
    "premioDescricao" TEXT,
    "periodoInicio" DATE,
    "periodoFim" DATE,

    CONSTRAINT "Beneficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "produtoIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,
    "metaCentavos" INTEGER NOT NULL,
    "metaIndividualCentavos" INTEGER,
    "comissaoBps" INTEGER NOT NULL,
    "visibilidade" "Visibilidade" NOT NULL DEFAULT 'aberta',
    "entrega" "Entrega" NOT NULL DEFAULT 'publicar',
    "briefing" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "beneficioIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "StatusCampanha" NOT NULL DEFAULT 'rascunho',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participacao" (
    "campanhaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "StatusParticipacao" NOT NULL,
    "aceitaEm" TIMESTAMP(3),
    "comissaoBpsNoAceite" INTEGER,

    CONSTRAINT "Participacao_pkey" PRIMARY KEY ("campanhaId","creatorId")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "nuvemshopId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "cupom" TEXT,
    "creatorId" TEXT,
    "campanhaId" TEXT,
    "subtotalCentavos" INTEGER NOT NULL,
    "descontoCentavos" INTEGER NOT NULL,
    "freteCentavos" INTEGER NOT NULL,
    "totalCentavos" INTEGER NOT NULL,
    "baseComissaoCentavos" INTEGER NOT NULL,
    "devolvidoCentavos" INTEGER NOT NULL DEFAULT 0,
    "ufComprador" CHAR(2),
    "emailComprador" TEXT,
    "estado" "EstadoPedido" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),
    "autocompra" BOOLEAN NOT NULL DEFAULT false,
    "envioCreator" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoNuvemshopId" INTEGER NOT NULL,
    "produtoId" TEXT,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitarioCentavos" INTEGER NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvisoWebhook" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT,
    "storeId" INTEGER NOT NULL,
    "evento" TEXT NOT NULL,
    "recursoId" INTEGER,
    "corpo" JSONB NOT NULL,
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),
    "erro" TEXT,

    CONSTRAINT "AvisoWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "campanhaId" TEXT,
    "baseCentavos" INTEGER NOT NULL,
    "taxaBps" INTEGER NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "tipo" "TipoComissao" NOT NULL,
    "status" "StatusComissao" NOT NULL,
    "liberaEm" TIMESTAMP(3) NOT NULL,
    "retida" BOOLEAN NOT NULL DEFAULT false,
    "pagamentoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "pagoEm" TIMESTAMP(3) NOT NULL,
    "forma" "FormaPagamento" NOT NULL,
    "comprovanteUrl" TEXT,
    "registradoPor" TEXT NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "campanhaId" TEXT,
    "creatorId" TEXT,
    "origem" "OrigemVideo" NOT NULL,
    "rede" "Rede",
    "formato" "FormatoVideo",
    "link" TEXT,
    "arquivoUrl" TEXT,
    "miniaturaUrl" TEXT,
    "duracaoSeg" INTEGER,
    "tamanhoBytes" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "StatusVideo" NOT NULL DEFAULT 'em_analise',
    "motivoReprovacao" TEXT,
    "views" INTEGER,
    "curtidas" INTEGER,
    "comentarios" INTEGER,
    "publicadoEm" TIMESTAMP(3),
    "direito" "DireitoVideo" NOT NULL DEFAULT 'organico',
    "direitoAte" TIMESTAMP(3),
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colecao" (
    "id" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "videoIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Colecao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TokenSenha_tokenHash_key" ON "TokenSenha"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Loja_slug_key" ON "Loja"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Loja_nuvemshopStoreId_key" ON "Loja"("nuvemshopStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_usuarioId_key" ON "Creator"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Afiliacao_lojaId_creatorId_key" ON "Afiliacao"("lojaId", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Cupom_lojaId_codigoNormalizado_key" ON "Cupom"("lojaId", "codigoNormalizado");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_lojaId_nuvemshopId_key" ON "Produto"("lojaId", "nuvemshopId");

-- CreateIndex
CREATE INDEX "Pedido_lojaId_pagoEm_idx" ON "Pedido"("lojaId", "pagoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_lojaId_nuvemshopId_key" ON "Pedido"("lojaId", "nuvemshopId");

-- CreateIndex
CREATE INDEX "Comissao_lojaId_status_idx" ON "Comissao"("lojaId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Comissao_pedidoId_tipo_key" ON "Comissao"("pedidoId", "tipo");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenSenha" ADD CONSTRAINT "TokenSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afiliacao" ADD CONSTRAINT "Afiliacao_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afiliacao" ADD CONSTRAINT "Afiliacao_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupom" ADD CONSTRAINT "Cupom_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupom" ADD CONSTRAINT "Cupom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficio" ADD CONSTRAINT "Beneficio_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participacao" ADD CONSTRAINT "Participacao_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participacao" ADD CONSTRAINT "Participacao_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvisoWebhook" ADD CONSTRAINT "AvisoWebhook_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "Pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colecao" ADD CONSTRAINT "Colecao_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
