/*
  Warnings:

  - You are about to alter the column `telefone` on the `vendas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(11)`.

*/
-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "nome" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "telefone" SET DATA TYPE VARCHAR(11);
