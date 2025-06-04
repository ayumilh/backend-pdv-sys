import { prisma } from '../../../prisma/prismaClient';
import { StockMovementType } from '@prisma/client';

interface CreateMovementDTO {
  productId: string;
  quantity: number;
  type: StockMovementType;
  userId: string;
}

export const getAllMovements = async () => {
  return prisma.stockMovement.findMany({
    include: {
      product: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getMovementById = async (id: string) => {
  return prisma.stockMovement.findUnique({
    where: { id },
    include: {
      product: true,
      user: true,
    },
  });
};

export const createMovement = async ({ productId, quantity, type, userId }: CreateMovementDTO) => {
  const movement = await prisma.stockMovement.create({
    data: {
      productId,
      quantity,
      type,
      userId,
    },
  });

  // Atualiza o estoque do produto
  const stockChange = type === 'ENTRADA' ? quantity : -quantity;

  await prisma.product.update({
    where: { id: productId },
    data: {
      stock: {
        increment: stockChange,
      },
    },
  });

  return movement;
};

export const getMovementsByProduct = async (productId: string) => {
  return prisma.stockMovement.findMany({
    where: { productId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteMovement = async (id: string) => {
  const existing = await prisma.stockMovement.findUnique({ where: { id } });

  if (!existing) return null;

  // desfaz o efeito no estoque
  const quantityChange =
    existing.type === 'ENTRADA' ? -existing.quantity : existing.quantity;

  await prisma.product.update({
    where: { id: existing.productId },
    data: {
      stock: {
        increment: quantityChange,
      },
    },
  });

  return prisma.stockMovement.delete({ where: { id } });
};
