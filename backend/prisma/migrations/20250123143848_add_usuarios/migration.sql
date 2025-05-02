/*
  Warnings:

  - Added the required column `nome` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nome" VARCHAR(100) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "senha" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "gastos_pessoais" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "empresa" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "vencimento" DATE,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "gastos_pessoais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_pj" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "empresa" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "gastos_pj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lucros" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "cliente" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "vendaId" INTEGER,

    CONSTRAINT "lucros_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gastos_pessoais" ADD CONSTRAINT "gastos_pessoais_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_pj" ADD CONSTRAINT "gastos_pj_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lucros" ADD CONSTRAINT "lucros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lucros" ADD CONSTRAINT "lucros_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
