-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO_TOTAL', 'CANCELADO', 'AGUARDANDO_ENTREGA');

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "statusPagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE';
