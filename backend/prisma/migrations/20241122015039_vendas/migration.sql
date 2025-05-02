-- CreateTable
CREATE TABLE "vendas" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "entrega" DATE,
    "nome" VARCHAR(100) NOT NULL,
    "cpf" CHAR(11) NOT NULL,
    "telefone" VARCHAR(20),
    "endereco" VARCHAR(200) NOT NULL,
    "complemento" VARCHAR(100),
    "lentes" VARCHAR(100) NOT NULL,
    "armacao" VARCHAR(100) NOT NULL,
    "preco" DECIMAL(65,30) NOT NULL,
    "sinal" DECIMAL(65,30),
    "a_pagar" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "obs" TEXT,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);
