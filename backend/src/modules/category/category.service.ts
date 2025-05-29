import { prisma } from '../../../prisma/prismaClient';

export const listCategories = async () => {
  return await prisma.category.findMany();
};

export const getCategoryById = async (id: string) => {
  return await prisma.category.findUnique({ where: { id } });
};

export const createCategory = async (data: { name: string }) => {
  return await prisma.category.create({ data });
};

export const updateCategory = async (id: string, data: { name: string }) => {
  return await prisma.category.update({ where: { id }, data });
};
