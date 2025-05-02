/*
  Warnings:

  - You are about to alter the column `preco` on the `vendas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `sinal` on the `vendas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `a_pagar` on the `vendas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "sinal" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "a_pagar" SET DATA TYPE DECIMAL(10,2);
