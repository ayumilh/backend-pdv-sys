/*
  Warnings:

  - Made the column `telefone` on table `vendas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "telefone" SET NOT NULL,
ALTER COLUMN "a_pagar" DROP NOT NULL;
