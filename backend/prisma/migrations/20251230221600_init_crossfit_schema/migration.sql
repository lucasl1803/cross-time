/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UsuarioTipo" AS ENUM ('ALUNO', 'ADMIN');

-- CreateEnum
CREATE TYPE "AssinaturaStatus" AS ENUM ('PENDENTE', 'ATIVA', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('CRIADO', 'AGUARDANDO', 'PAGO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "SessaoStatus" AS ENUM ('ABERTA', 'LOTADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ReservaStatus" AS ENUM ('CONFIRMADA', 'CANCELADA');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "tipo" "UsuarioTipo" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "duracao_dias" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "plano_id" BIGINT NOT NULL,
    "status" "AssinaturaStatus" NOT NULL,
    "data_inicio" DATE,
    "data_fim" DATE,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" BIGSERIAL NOT NULL,
    "assinatura_id" BIGINT NOT NULL,
    "provedor" VARCHAR(30) NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "status" "PagamentoStatus" NOT NULL,
    "txid" VARCHAR(120),
    "qr_code_base64" TEXT,
    "copia_e_cola" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pago_em" TIMESTAMP(6),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wods" (
    "id" BIGSERIAL NOT NULL,
    "data_wod" DATE NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "descricao" TEXT NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_aula" (
    "id" BIGSERIAL NOT NULL,
    "data_aula" DATE NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "duracao_minutos" INTEGER NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "status" "SessaoStatus" NOT NULL,
    "wod_id" BIGINT NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" BIGSERIAL NOT NULL,
    "sessao_id" BIGINT NOT NULL,
    "aluno_id" BIGINT NOT NULL,
    "status" "ReservaStatus" NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelado_em" TIMESTAMP(6),

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_assinaturas_usuario" ON "assinaturas"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_pagamentos_assinatura" ON "pagamentos"("assinatura_id");

-- CreateIndex
CREATE UNIQUE INDEX "wods_data_wod_key" ON "wods"("data_wod");

-- CreateIndex
CREATE INDEX "idx_sessoes_data" ON "sessoes_aula"("data_aula");

-- CreateIndex
CREATE UNIQUE INDEX "uq_sessao_dia_hora" ON "sessoes_aula"("data_aula", "hora_inicio");

-- CreateIndex
CREATE INDEX "idx_reservas_sessao" ON "reservas"("sessao_id");

-- CreateIndex
CREATE INDEX "idx_reservas_aluno" ON "reservas"("aluno_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_reserva_unica" ON "reservas"("sessao_id", "aluno_id");

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_assinatura_id_fkey" FOREIGN KEY ("assinatura_id") REFERENCES "assinaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_aula" ADD CONSTRAINT "sessoes_aula_wod_id_fkey" FOREIGN KEY ("wod_id") REFERENCES "wods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes_aula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;




