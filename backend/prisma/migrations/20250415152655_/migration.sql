/*
  Warnings:

  - You are about to alter the column `complemento` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to drop the column `clienteCpf` on the `vendas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_clienteCpf_fkey";

-- AlterTable
ALTER TABLE "clientes" ALTER COLUMN "cpf" DROP NOT NULL,
ALTER COLUMN "cpf" SET DATA TYPE TEXT,
ALTER COLUMN "endereco" DROP NOT NULL,
ALTER COLUMN "numero" DROP NOT NULL,
ALTER COLUMN "complemento" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "telefone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "clienteCpf",
ADD COLUMN     "clienteId" INTEGER,
ALTER COLUMN "lentes" DROP NOT NULL,
ALTER COLUMN "armacao" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
