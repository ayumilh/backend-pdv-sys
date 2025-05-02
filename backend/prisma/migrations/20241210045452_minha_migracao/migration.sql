/*
  Warnings:

  - You are about to drop the column `complemento` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `vendas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clienteCpf` to the `vendas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "complemento",
DROP COLUMN "cpf",
DROP COLUMN "endereco",
DROP COLUMN "nome",
DROP COLUMN "telefone",
ADD COLUMN     "clienteCpf" CHAR(11) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteCpf_fkey" FOREIGN KEY ("clienteCpf") REFERENCES "clientes"("cpf") ON DELETE RESTRICT ON UPDATE CASCADE;
