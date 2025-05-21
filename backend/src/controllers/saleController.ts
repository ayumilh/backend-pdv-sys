import { Request, Response, NextFunction } from "express";
import { prisma } from "@/prisma/prismaClient";

// Criar nova venda
export const createSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId, userId, terminalId, total, paymentMethod, items } = req.body;

    if (!userId || !total || !paymentMethod || !items?.length) {
      return next({
        statusCode: 400, 
        message: "Dados inválidos para criar a venda",
      });
    }

    const newSale = await prisma.sale.create({
      data: {
        clientId: "client-uuid",
        userId: "user-uuid",
        terminalId: "terminal-uuid",
        total: 150,
        paymentMethod: "DINHEIRO",
        items: {
          create: [
            {
              productId: "product-uuid",
              quantity: 2,
              price: 75,
              weighingId: "weighing-uuid"  // Use o weighingId correto aqui
            }
          ]
        }
      },
      include: {
        items: true
      }
    });
    

    res.status(201).json(newSale); // Retorna a venda criada
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return next(error); // Passa o erro para o middleware de erro
  }
};

// Listar vendas
export const getAllSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        client: true,
        user: true,
        terminal: true,
        items: {
          include: {
            product: true,
            weighing: true,  // Incluindo as pesagens associadas aos itens
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(sales); // Retorna todas as vendas
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return next(error); // Passa o erro para o middleware de erro
  }
};

// Buscar venda por ID
export const getSaleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        user: true,
        terminal: true,
        items: {
          include: {
            product: true,
            weighing: true,  // Incluindo as pesagens associadas aos itens
          },
        },
      },
    });

    if (!sale) {
      return next({
        statusCode: 404,  // Não encontrado
        message: "Venda não encontrada",
      });
    }

    res.status(200).json(sale); // Retorna a venda encontrada
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    return next(error); // Passa o erro para o middleware de erro
  }
};

