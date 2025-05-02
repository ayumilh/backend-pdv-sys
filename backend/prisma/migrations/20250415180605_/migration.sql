/*
  Warnings:

  - You are about to drop the column `clienteCpf` on the `graus` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `graus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "graus" DROP CONSTRAINT "graus_clienteCpf_fkey";

-- AlterTable
ALTER TABLE "graus" DROP COLUMN "clienteCpf",
ADD COLUMN     "clienteId" CHAR(11) NOT NULL;

-- AddForeignKey
ALTER TABLE "graus" ADD CONSTRAINT "graus_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("cpf") ON DELETE RESTRICT ON UPDATE CASCADE;
