-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "alturaPupilar" VARCHAR(10);

-- CreateTable
CREATE TABLE "graus" (
    "id" SERIAL NOT NULL,
    "lente" VARCHAR(20) NOT NULL,
    "olho" VARCHAR(2) NOT NULL,
    "esferico" VARCHAR(10),
    "cilindrico" VARCHAR(10),
    "eixo" VARCHAR(10),
    "add" VARCHAR(10),
    "dp" VARCHAR(10),
    "data" DATE NOT NULL,
    "clienteCpf" CHAR(11) NOT NULL,

    CONSTRAINT "graus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "graus" ADD CONSTRAINT "graus_clienteCpf_fkey" FOREIGN KEY ("clienteCpf") REFERENCES "clientes"("cpf") ON DELETE RESTRICT ON UPDATE CASCADE;
