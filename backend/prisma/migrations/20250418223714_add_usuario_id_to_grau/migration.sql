-- AlterTable
ALTER TABLE "graus" ADD COLUMN     "usuarioId" INTEGER;

-- AddForeignKey
ALTER TABLE "graus" ADD CONSTRAINT "graus_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
