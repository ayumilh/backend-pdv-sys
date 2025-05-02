/*
  Warnings:

  - The `clienteId` column on the `graus` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "graus" DROP CONSTRAINT "graus_clienteId_fkey";

-- AlterTable
ALTER TABLE "graus" DROP COLUMN "clienteId",
ADD COLUMN     "clienteId" INTEGER;

-- AddForeignKey
ALTER TABLE "graus" ADD CONSTRAINT "graus_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
