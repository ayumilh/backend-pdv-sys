const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient, StatusPagamento  } = require("@prisma/client");

let prisma;

if (!global.prisma) {
  prisma = new PrismaClient();

  prisma.$connect()
    .then(() => {
      console.log("Conectado ao PostgreSQL com Prisma");
    })
    .catch((error) => {
      console.error("Erro ao conectar com Prisma:", error);
      process.exit(1);
    });

  global.prisma = prisma;
} else {
  prisma = global.prisma;
}

module.exports = { prisma, StatusPagamento };
