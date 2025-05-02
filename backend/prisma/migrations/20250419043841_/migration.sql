/*
  Warnings:

  - You are about to drop the column `statusPagamento` on the `vendas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "statusPagamento",
ADD COLUMN     "StatusPagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE';
