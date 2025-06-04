import bcrypt from "bcrypt";
import { prisma } from '../../../prisma/prismaClient'

interface UserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'CAIXA' | 'ESTOQUISTA';
}

export const userService = {
  async create(data: UserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      }
    });
  },

  async update(id: string, data: Partial<UserInput>) {
    const updatedData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
    };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data: updatedData,
    });
  },
  async getAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },


  async getStockMovements(userId: string) {
    return await prisma.stockMovement.findMany({
      where: { userId },
      include: {
        product: {
          select: { name: true, id: true },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
