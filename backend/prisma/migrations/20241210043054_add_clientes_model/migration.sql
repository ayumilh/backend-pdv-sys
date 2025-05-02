-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "cpf" CHAR(11) NOT NULL,
    "endereco" VARCHAR(200) NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "complemento" VARCHAR(100),
    "telefone" VARCHAR(11) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);
