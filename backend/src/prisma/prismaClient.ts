import dotenv from "dotenv";
dotenv.config();

import { PrismaClient, SaleStatus, PaymentMethod } from "@prisma/client";

// Estendendo o tipo global para incluir a propriedade prisma
declare global {
  // Isso impede erros TS quando reusando a instância no ambiente de desenvolvimento
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (!global.prisma) {
  prisma.$connect()
    .then(() => {
      console.log("Conectado ao PostgreSQL com Prisma");
    })
    .catch((error) => {
      console.error("Erro ao conectar com Prisma:", error);
      process.exit(1);
    });

  global.prisma = prisma;
}

export { prisma, SaleStatus, PaymentMethod };
